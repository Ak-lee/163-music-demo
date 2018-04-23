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
            <div class="row">
                <label>封面</label>
                <input name="cover" type="text" value="__cover__">
                <div id="uploadCover-container">
                    <button id="uploadCover">...</button>
                </div>
            </div>
            <div id="submit-btn" class="row actions">
                <button type="submit">保存</button>
            </div>
        </form>
        `,
        render(data={}){ // 如果没有传data,就把data赋值为空。这是ES6语法
            let placeholders=['name','singer','url','id','cover']
            let html = this.template;
            placeholders.map((string)=>{
                html =html.replace(`__${string}__`,data[string] || '')
            })
            $(this.el).html(html);
            if(!data.id){
                $(this.el).prepend('<h1>新建歌曲</h1>')
            }else{
                $(this.el).prepend('<h1>编辑歌曲</h1>')
                $('#submit-btn').append('<button id="btn-delete"">删除</button>')
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
            song.set('cover',data.cover);
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
                id:'',
                cover:''
            }
        },
        update(data){
            var song = AV.Object.createWithoutData('Song',this.data.id)
            song.set('name',data.name);
            song.set('singer',data.singer)
            song.set('url',data.url)
            song.set('cover',data.cover)
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
        },
        delete(){
            var song = AV.Object.createWithoutData('Song', this.data.id);
            return song.destroy().then((data)=>{
                this.reset()
                return data;
            },(error)=>{
                console.error(error);
            })
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
          this.initQiniu();
        },
        bindEvntHub(){
            window.eventHub.on('select',(data)=>{
                this.model.data=data;
                this.view.render(this.model.data)
                this.initQiniu();
            });
            window.eventHub.on('new',(data)=>{
                if(this.model.data.id){
                    this.model.reset();
                }else{
                    Object.assign(this.model.data,data)
                }
                this.view.render(this.model.data)
                this.initQiniu();
            })
            window.eventHub.on('uploadCover',(data)=>{
                $(this.view.el).find('input[name="cover"]').val(data.url);
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
            });
            $(this.view.el).on('click','#btn-delete',()=> {
                var oldData = JSON.parse(JSON.stringify(this.model.data))   // 需要深拷贝
                this.model.delete().then(() => {
                    window.eventHub.emit('new')
                    window.eventHub.emit('delete',oldData)
                })
            })
        },
        create(){
            let needs = 'name singer url cover'.split(' ');
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
            let needs = 'name singer url cover'.split(' ');
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
        initQiniu(){
            //引入Plupload 、qiniu.js后
            var uploader = Qiniu.uploader({
                runtimes: 'html5',    //上传模式,依次退化
                browse_button: $('#uploadCover-container').find('#uploadCover')[0],       //上传选择的点选按钮，**必需**
                uptoken_url: 'http://localhost:8888/uptoken', //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
                // unique_names: true, // 默认 false，key为文件名。若开启该选项，SDK为自动生成上传成功后的key（文件名）。
                // save_key: true,   // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK会忽略对key的处理
                domain: 'p5kug22vf.bkt.clouddn.com',   //bucket 域名，下载资源时用到，**必需**
                //ozp6nmbl9.bkt.clouddn.com 仅示例。为七牛提供的测试域名

                get_new_uptoken: false,  //设置上传文件的时候是否每次都重新获取新的token
                max_file_size: '40mb',           //最大文件体积限制
                dragdrop: false,                   //不开启可拖曳上传
                auto_start: true,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传
                init: {
                    'FilesAdded': function(up, files) {
                        plupload.each(files, function(file) {
                            // 文件添加进队列后,处理相关的事情
                        });
                    },
                    'BeforeUpload': function(up, file) {
                        // 每个文件上传前,处理相关的事情
                        window.eventHub.emit("beforeUpload")
                    },
                    'UploadProgress': function(up, file) {
                        // 每个文件上传时,处理相关的事情
                    },
                    'FileUploaded': function(up, file, info) {
                        // 每个文件上传成功后,处理相关的事情
                        // 其中 info.response 是文件上传成功后，服务端返回的json，形式如
                        // {
                        //    "hash": "Fh8xVqod2MQ1mocfI4S4KpRL6D98",
                        //    "key": "gogopher.jpg"
                        //  }
                        // 参考http://developer.qiniu.com/docs/v6/api/overview/up/response/simple-response.html

                        var domain = up.getOption('domain');
                        var response = JSON.parse(info.response);
                        var sourceLink = 'http://'+domain +'/' +encodeURIComponent(response.key); //获取上传成功后的文件的Url
                        window.eventHub.emit("afterUpload")
                        window.eventHub.emit('uploadCover',{
                            url:sourceLink
                        })
                    },
                    'Error': function(up, err, errTip) {
                        //上传出错时,处理相关的事情
                    },
                    'UploadComplete': function() {
                        //队列文件处理完毕后,处理相关的事情
                    }

                }
            });
            // domain 为七牛空间（bucket)对应的域名，选择某个空间后，可通过"空间设置->基本设置->域名设置"查看获取
            // uploader 为一个plupload对象，继承了所有plupload的方法，参考http://plupload.com/docs
        }
    };
    controller.init(view,model);
}