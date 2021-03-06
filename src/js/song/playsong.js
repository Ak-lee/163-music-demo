{
    let view={
        el:'#page',
        init(){
            this.$el=$(this.el);
        },
        render(data){
            var {song,status}=data
            $(this.el).find('#background').css('background-image',`url(${song.cover})`)
            if(song.cover){
                $(this.el).find('img.cover').attr('src',song.cover)
            }
            if($(this.el).find('audio').attr('src')!==song.url){
                let audio= $(this.el).find('audio').attr('src',song.url)
                audio.on('ended',()=>{
                    // ended 事件不会冒泡
                    window.eventHub.emit('songEnd')
                });
                audio.on('timeupdate',()=>{
                    this.showLyrics(audio.get(0).currentTime)
                })
                $(this.el).find('.song-description>h1').text(song.name)

                let {lyrics}=song
                let array = lyrics.split('\n').map((string)=>{
                    let p = document.createElement('p')
                    var regex =/\[([\d:.]+)\](.+)/
                    let matches = string.match(regex)
                    if(matches){
                        p.textContent=matches[2];
                        let time=matches[1]
                        let parts=time.split(":");
                        let minutes = parts[0]
                        let second = parts[1]
                        let newTime = parseInt(minutes,10)*60+parseFloat(second)
                        p.setAttribute('data-time',newTime.toString())
                    }else{
                        p.textContent=string
                    }
                    return p;
                })
                $(this.el).find('.lyric>.lines').append(array);
            }
            if(status === 'playing'){
                $(this.el).find('.disc').removeClass('pause').addClass('playing')
                this.play()
            }else{
                $(this.el).find('.disc').removeClass('playing').addClass('pause')
                this.pause()
            }
        },
        play(){
            $(this.el).find('audio')[0].play()
        },
        pause(){
            $(this.el).find('audio')[0].pause()
        },
        showLyrics(time){
            let allP=$(this.el).find('.song-description>.lyric>.lines>p')
            let p
            for(let i = 0; i<allP.length; i++){
                if(i===allP.length-1){
                    p=allP[i]
                    break;
                }else{
                    let currentTime = allP.eq(i).attr('data-time')
                    let nextTime = allP.eq(i+1).attr('data-time')
                    if(currentTime<=time && time<nextTime){
                        p=allP[i]
                        let pHeight =p.getBoundingClientRect().top;
                        let lineHeight = $(this.el).find('.lyric>.lines')[0].getBoundingClientRect().top;
                        let height = pHeight - lineHeight;
                        $(this.el).find('.song-description>.lyric>.lines').css('transform',`translateY(${-height+25}px)`)
                        break;
                    }
                }
            }
            $(p).addClass('active').siblings('.active').removeClass('active')
        }
    }
    let model={
        data:{
            song:{
                id:'',
                name:'',
                singer:'',
                url:"",
                cover:''
            },
            status:'playing'
        },
        get(id){
            var query = new AV.Query('Song');
            return query.get(id).then((data)=>{
                this.data.song={id:data.id,
                    name:data.attributes.name,
                    singer:data.attributes.singer,
                    url:data.attributes.url,
                    cover:data.attributes.cover,
                    lyrics:data.attributes.lyrics
                }
                return JSON.parse(JSON.stringify(this.data))
            }, function (error) {
                // 异常处理
            });

        }
    }
    let controller={
        init(view,model){
            this.view=view;
            this.view.init()
            this.model=model;
            let id = this.getSongId()
            this.model.get(id)
                .then((data)=>{
                    this.model.data.status==='playing'
                    this.view.render(this.model.data)
                    this.view.play()
                })
            this.bindEvents()
        },
        bindEvents(){
            this.view.$el.on('click','.disc.pause',()=>{
                this.model.data.status='playing'
                this.view.render(this.model.data)
            })
            this.view.$el.on('click','.disc.playing',()=>{
                this.model.data.status='pause'
                this.view.render(this.model.data)
            })
            window.eventHub.on('songEnd',()=>{
                this.model.data.status='pause'
                this.view.render(this.model.data)
            })
        },
        getSongId(){
            let search = window.location.search
            if(search.indexOf('?')=== 0){
                search=search.substring(1);
            }
            let array = search.split('&').filter((v)=>{return v})
            let songId='';
            for(let i=0;i<array.length;i++){
                let keyValue= array[i].split('=')
                let key=keyValue[0];
                let value=keyValue[1]
                if(key ==='id'){
                    songId=value
                    break;
                }
            }
            return songId;
        }
    }
    controller.init(view,model)
}