{
    let view = {
        el:'#songList-container',
        template:`
            <ul class="songList">
            </ul>
        `,
        render(data){
            let $el=$(this.el)
            $el.html(this.template)
            let songs =data.songs
            let liList = songs.map((song)=>{
                let li=$('<li></li>')   // jQuery 创建一个元素的方法
                li.text(song.name)      // jQuery 修改一个元素文本的方法、
                li.attr('song-id',song.id);
                return li
            })
            $el.find('ul').empty()
            liList.map((domLi)=>{
                $el.find('ul').append(domLi)
            })

        },
        clearActive(){
            $(this.el).find('.active').removeClass('active')
        },
        activeItem(li){
            let $li=$(li);
            $li.addClass('active')
                .siblings(".active").removeClass('active');
        }

    };
    let model={
        data:{
            songs:[]
        },
        find(){
            var query = new AV.Query('Song')
            return query.find().then((songs)=>{
                songs.map(
                    (songItem)=>{
                        this.data.songs.push({id:songItem.id, ...songItem.attributes});
                    }
                );
                return this.data
            })
        }
    };
    let controller = {
        init(view,model){
            this.view = view;
            this.model=model;
            this.view.render(this.model.data);
            this.getAllSongs();
            this.bindEvents()
            this.bindEvntHub();
        },
        bindEvents(){
            $(this.view.el).on('click','li',(e)=>{
                this.view.activeItem(e.currentTarget);
                let songId = e.currentTarget.getAttribute("song-id")
                let data={};
                let songs = this.model.data.songs
                for (let i=0;i<songs.length;i++){
                    if(songs[i].id===songId){
                        data={...songs[i]}  // 做一个深拷贝
                        break;
                    }
                }
                window.eventHub.emit('select',data)
            })

        },
        bindEvntHub(){
            window.eventHub.on("upload",()=>{
                this.view.clearActive()
            });
            window.eventHub.on("create",(songData)=>{
                this.model.data.songs.push(songData);
                this.view.render(this.model.data)
            });
        },
        getAllSongs(){
            return this.model.find().then(()=>{
                this.view.render(this.model.data)
            })
        }
    };
    controller.init(view,model);
}