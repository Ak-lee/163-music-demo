{
    let view={
        el:".page>main",
        template:`
        <h1>新建歌曲</h1>
        <form class="form">
            <div class="row">
                <label>歌名</label>
                <input name="name" type="text" value="__name__">
            </div>
            <div class="row">
                <label>歌手</label>
                <input name="singer" type="text" value="__singer__">
            </div>
            <div class="row">
                <label>外链</label>
                <input name="url" type="text" value="__url__">

            </div>
            <div class="row actions">
                <button type="submit">保存</button>
            </div>
        </form>
        `,
        render(data={}){ // 如果没有传data,就把data赋值为空。这是ES6语法
            let placeholders=['name','singer','url','id']
            let html = this.template;
            placeholders.map((string)=>{
                html =html.replace(`__${string}__`,data[string] || '')
            })
            $(this.el).html(html)
        },
        init(){
            this.$el=$(this.el)
        },
        reset(){
            this.render({})
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
            // 函数功能：上传表单数据
            // 声明类型
            var Song = AV.Object.extend('Song');
            // 新建对象
            var song = new Song();
            // 设置名称
            song.set('name',data.name);
            // 设置优先级
            song.set('singer',data.singer);
            song.set('url',data.url);
            return song.save().then((newSong)=>{    // return 一个 Promise
                // 让 model 拿到最新的数据，毕竟我们上传时不知道leancloud后台会给出的id
                let {id,attributes}=newSong;
                Object.assign(this.data,{
                    id,
                    ...attributes
                })
            },(error)=>{
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
              this.model.data = data
              this.view.render(this.model.data)
        })
        },
        bindEvents(){
            this.view.$el.on('submit','form',(e)=>{
                e.preventDefault();
                let needs = 'name singer url'.split(' ');
                let data =[];
                // 拿到表单数据
                needs.map((string)=>{
                    data[string]=this.view.$el.find(`input[name=${string}]`).val();
                })
                this.model.create(data)
                    .then(()=>{
                        this.view.reset();
                        // 不要直接把一个对象直接传个另一个模块。应该做一下深拷贝,实现解耦
                        // 错误示例 window.eventHub.emit('create',this.model.data)
                        let string=JSON.stringify(this.model.data)
                        let object=JSON.parse(string)
                        window.eventHub.emit("create",object)
                    })
            })
        }
    };
    controller.init(view,model);
}