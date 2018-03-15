{
    let view={
        el:".page>main",
        template:`
        <h1>新建歌曲</h1>
        <form class="form">
            <div class="row">
                <label>歌名</label>
                <input name="name" type="text" value="__key__">
            </div>
            <div class="row">
                <label>歌手</label>
                <input name="singer" type="text">
            </div>
            <div class="row">
                <label>外链</label>
                <input name="url" type="text" value="__link__">

            </div>
            <div class="row actions">
                <button type="submit">保存</button>
            </div>
        </form>
        `,
        render(data={}){
            let placeholders=['key','link']
            let html = this.template;
            placeholders.map((string)=>{
                html =html.replace(`__${string}__`,data[string] || '')
            })
            $(this.el).html(html)
        },
        init(){
            this.$el=$(this.el)
        }
    };

    let model={
        data:{
            name:'',
            singer:'',
            url:'',
            id:''
        },
        create(data){
            // 声明类型
            var Song = AV.Object.extend('Song');
            // 新建对象
            var song = new Song();
            // 设置名称
            song.set('name',data.name);
            // 设置优先级
            song.set('singer',data.singer);
            song.set('url',data.url);
            song.save().then((newSong)=>{
                console.log(newSong);
            },  (error)=>{
                console.error(error);
            });
        }
    };
    let controller = {
        view:'',
        model:'',
        init(view,model){
          this.view = view;
          this.model = model;
          this.view.init();
          this.view.render(this.model.data)
          this.bindEvents()
          window.eventHub.on('upload',(data)=>{
              this.view.render(data)
        })
        },
        bindEvents(){
            this.view.$el.on('submit','form',(e)=>{
                e.preventDefault();
                let needs = 'name singer url'.split(' ');
                let data =[];
                needs.map((string)=>{
                    data[string]=this.view.$el.find(`input[name=${string}]`).val();
                })
                this.model.create(data);
            })
        }
    };
    controller.init(view,model);
}