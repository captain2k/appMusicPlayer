const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEYS = 'F8_Player';

const songs = $$('.song');
const playlist = $('.playlist');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const play = $('.player');
const progress = $('#progress');
const nextSongBtn = $('.btn-next');
const prevSongBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const songActive = $('.song.active');


const app = {
    currentIndex: 0,
    isRandom : false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEYS)) || {},
    
    songs: [
        {
            name: 'Hết nhạc con về',
            singer: 'DUYB & NOT AFRAID ft RZ Mas',
            path: './assets/song/song1.mp3',
            image: './assets/img/song1.jpg'
        },
        {
            name: 'Sang Xịn Mịn REMIX',
            singer: 'Gill ft. Kewtiie x CUKAK',
            path: './assets/song/song2.mp3',
            image: './assets/img/song2.jpg'
        },
        {
            name: 'Bật Nhạc Lên',
            singer: 'HIEUTHUHAI ft. Harmonie',
            path: './assets/song/song3.mp3',
            image: './assets/img/song3.jpg'
        },
        {
            name: 'Lớp 13',
            singer: 'Tage',
            path: './assets/song/song4.mp3',
            image: './assets/img/song4.jpg'
        },
        {
            name: 'Thích Quá Rùi Nà',
            singer: 'tlinh feat. Trung Trần (prod. by Pacman)',
            path: './assets/song/song5.mp3',
            image: './assets/img/song5.jpg'
        },
        {
            name: 'Hết nhạc con về',
            singer: 'DUYB & NOT AFRAID ft RZ Mas',
            path: './assets/song/song1.mp3',
            image: './assets/img/song1.jpg'
        },
        {
            name: 'Sang Xịn Mịn REMIX',
            singer: 'Gill ft. Kewtiie x CUKAK',
            path: './assets/song/song2.mp3',
            image: './assets/img/song2.jpg'
        },
        {
            name: 'Bật Nhạc Lên',
            singer: 'HIEUTHUHAI ft. Harmonie',
            path: './assets/song/song3.mp3',
            image: './assets/img/song3.jpg'
        },
        {
            name: 'Lớp 13',
            singer: 'Tage',
            path: './assets/song/song4.mp3',
            image: './assets/img/song4.jpg'
        },
        {
            name: 'Thích Quá Rùi Nà',
            singer: 'tlinh feat. Trung Trần (prod. by Pacman)',
            path: './assets/song/song5.mp3',
            image: './assets/img/song5.jpg'
        }
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEYS, JSON.stringify(this.config))
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong',{
            get: function() {
                return this.songs[this.currentIndex];
            } 
        })
    },
    
    handleEvents: function() {
        const cdWidth = cd.offsetWidth;
        isPlaying = false;

        // xử lý ẩn hiện đĩa cd
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth ;
        }

        // khi bài hát được play, xử lý btn thành pause     
        audio.onplay = function() {
            isPlaying = true;
            play.classList.add('playing');
        }

        // Khi bài hát bị pause, xử lý btn thành play
        audio.onpause = function() {
            isPlaying = false;
            play.classList.remove('playing');
        }

        // Xử lý phát nhạc
        playBtn.onclick = function() {
            if(isPlaying) {
                audio.pause();
                cdRotate.pause();
            } else {
                audio.play();
                cdRotate.play(); 
            }
        }

        // Khi phát nhạc, xử lý thanh bài hát chạy theo tiến độ của bài hát
        audio.ontimeupdate = function() {
            const progressPercent = (audio.currentTime / audio.duration * 100);
            if(progressPercent) {
                progress.value = progressPercent;
            }
        }

        // Xử lý khi tua
        progress.oninput = function(e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
            audio.play();
        }

        // Xử lý quay đĩa nhạc
        var cdRotate = cdThumb.animate([
            {
                transform: 'rotate(360deg)'
            }
        ],{
            duration: 10000,
            iterations: Infinity
        })

        cdRotate.pause();

        // Xử lý khi next songs
        nextSongBtn.onclick = function() {
            if(app.isRandom){
                app.randomSongs();
            }else{
                app.nextSongs();
            }
            audio.play();
            app.scrollSongIntoView();
        }

        // Xử lý khi prev songs
        prevSongBtn.onclick = function() {
            if(app.isRandom){
                app.randomSongs();
            }else{
                app.prevSongs();
            }
            audio.play();
            app.scrollSongIntoView();
        }

        // Xử lý nút random khi click vào
        randomBtn.onclick = function() {
            app.isRandom = !app.isRandom;
            app.setConfig("isRandom", app.isRandom)
            randomBtn.classList.toggle('active', app.isRandom);
        }

        // Xử lý nút repeat khi click vào
        repeatBtn.onclick = function() {
            app.isRepeat = !app.isRepeat;
            app.setConfig("isRepeat", app.isRepeat)
            repeatBtn.classList.toggle('active', app.isRepeat);
        }

        // Xử lý tự động next song và repeat
        audio.onended = function() {
            if(app.isRepeat) {
                audio.play();
            } else {
                nextSongBtn.click();
            }
        }

        // Xử lý khi click vào song thì song play và active
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            if( songNode || e.target.closest('.option')) {
                // Khi bấm vào songNode
                if(songNode) {
                    app.currentIndex = Number(songNode.dataset.index);
                    app.loadCurrentSong();
                    audio.play();
                }
            }
        }
    }, 
        
    renderSongs: function() {
        var htmls = this.songs.map((song, index) => {
            return `<div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = "${index}">
                        <div class="thumb" style="background-image: url(${song.image})">
                        </div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                                <p class="author">${song.singer}</p>
                        </div>
                        <div class="option">
                            <i class="fas fa-ellipsis-h"></i>
                        </div>
                    </div>`
        })
        playlist.innerHTML = htmls.join('');
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;

        if ($('.song.active')) 
            {
                $('.song.active').classList.remove('active');
            }
            $$('.song')[app.currentIndex].classList.add('active')

    },

    nextSongs: function() {
        this.currentIndex ++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSongs: function() {
        this.currentIndex --;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }   
        this.loadCurrentSong();
    },

    randomSongs: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (this.currentIndex === newIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    scrollSongIntoView: function() {
        setTimeout(() => {
            if(this.currentIndex <= 3) {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                })
            } else {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                })
            }
        },300)
    },        
 
    start: function() {
        this.loadConfig();
        this.handleEvents();
        this.renderSongs();
        this.defineProperties();
        this.loadCurrentSong();

        repeatBtn.classList.toggle('active', app.isRepeat);
        randomBtn.classList.toggle('active', app.isRandom);
    }

}

app.start();


