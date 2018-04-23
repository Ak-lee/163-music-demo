{
    let view={
        el:'#page',
        init(){
            this.$el=$(this.el);
        }
    }
    let model={
        data:{
            song:{
                id:'',
                name:'',
                singer:'',
                url:""
            },
        status:'pause'
        },
        get(id){
            var query = new AV.Query('Song');
            return query.get(id).then((data)=>{
                this.data.song={id:data.id,
                    name:data.attributes.name,
                    singer:data.attributes.singer,
                    url:data.attributes.url}
                return JSON.parse(JSON.stringify(this.data.song))
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
                    this.view.render(data)
                })
            this.bindEvents()
        },

        bindEvents(){
            this.view.$el.on('click','.play',()=>{
                this.view.play()
            })
            this.view.$el.on('click','.pause',()=>{
                this.view.pause()
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