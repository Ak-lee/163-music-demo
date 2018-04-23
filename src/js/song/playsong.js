{
    let view={
        el:'#page',
        init(){
            this.$el=$(this.el);
        },
        render(data){
            var {song,status}=data
            $(this.el).find('#background').css('background-image',`url(${song.cover})`)
            $(this.el).find('img.cover').attr('src',song.cover)
            if($(this.el).find('audio').attr('src')!==song.url){
                $(this.el).find('audio').attr('src',song.url)
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
                    cover:data.attributes.cover
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