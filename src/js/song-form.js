{
    let view={
        el:".page>main",
        template:`
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
            $(this.el).html(html);
            if(!data.id){
                $(this.el).prepend('<h1>新建歌曲</h1>')
            }else{
                $(this.el).prepend('<h1>编辑歌曲</h1>')
            }
        },
        init(){
            this.$el=$(this.el)
        },
        reset(){
            this.render({})
        }
    };

    let model={
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
                // 让 model 拿到最新的数据，毕竟我们上传前不知道leancloud后台会返回的id
                let {id,attributes}=newSong;
                Object.assign(this.data,{
                    id,
                    ...attributes
                })
            },(error)=>{
                console.error(error);
            });
        },
        reset(){
            this.data={
                name:'',
                singer:'',
                url:'',
                id:''
            }
        },
        update(data){
            var song = AV.Object.createWithoutData('Song',this.data.id)
            song.set('name',data.name);
            song.set('singer',data.singer)
            song.set('url',data.url)
            return song.save().then((newSong)=>{
                let {id,attributes}=newSong;
                Object.assign(this.data,{
                    id,
                    ...attributes
                })
                return newSong;
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
          this.model.reset();
          this.view.init();
          this.view.render(this.model.data)
          this.bindEvents()
          this.bindEvntHub();

        },
        bindEvntHub(){
            window.eventHub.on('select',(data)=>{
                this.model.data=data;
                this.view.render(this.model.data)
            });
            window.eventHub.on('new',(data)=>{
                if(this.model.data.id){
                    this.model.reset();
                }else{
                    Object.assign(this.model.data,data)
                }
                this.view.render(this.model.data)
            })
        },
        create(){
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
        },
        update(){
            let needs = 'name singer url'.split(' ');
            let data =[];
            // 拿到表单数据
            needs.map((string)=>{
                data[string]=this.view.$el.find(`input[name=${string}]`).val();
            })
            this.model.update(data)
                .then(()=>{
                    let string=JSON.stringify(this.model.data)
                    let object=JSON.parse(string)
                    window.eventHub.emit("update",object)
                })


        },
        bindEvents(){
            this.view.$el.on('submit','form',(e)=>{
                e.preventDefault();
               if(this.model.data.id){
                   this.update()
               }else{
                   this.create()
               }
            })
        }
    };
    controller.init(view,model);
}