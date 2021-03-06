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
            let selectedSongId=data.selectedSongId;
            let liList = songs.map((song)=>{
                let $li=$('<li></li>')   // jQuery 创建一个元素的方法
                $li.text(song.name)      // jQuery 修改一个元素文本的方法、
                $li.attr('song-id',song.id);
                if(song.id===selectedSongId){
                    $li.addClass("active");
                }
                return $li
            })
            $el.find('ul').empty()
            liList.map((domLi)=>{
                $el.find('ul').append(domLi)
            })

        },
        clearActive(){
            $(this.el).find('.active').removeClass('active')
        }

    };
    let model={
        data:{
            songs:[],
            selectedSongId:null
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
            this.bindEventHub();
        },
        bindEvents(){
            $(this.view.el).on('click','li',(e)=>{
                let songId = e.currentTarget.getAttribute("song-id")
                this.model.data.selectedSongId=songId
                this.view.render(this.model.data)
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
        bindEventHub(){
            window.eventHub.on("new",()=>{
                this.view.clearActive()
            });
            window.eventHub.on("create",(songData)=>{
                this.model.data.songs.push(songData);
                this.view.render(this.model.data)
            });
            window.eventHub.on("update",(data)=>{
                let songs=this.model.data.songs
                for(let i=0; i<songs.length;i++){
                    if(songs[i].id===data.id){
                        songs[i]=data;
                        this.view.render(this.model.data)
                    }
                }
            });
            window.eventHub.on('delete',(data)=>{
                let songs=this.model.data.songs
                for(let i=0; i<songs.length;i++){
                    if(songs[i].id===data.id){
                        this.model.data.songs.splice(i,1)
                        this.view.render(this.model.data)
                    }
                }
            })
        },
        getAllSongs(){
            return this.model.find().then(()=>{
                this.view.render(this.model.data)
            })
        }
    };
    controller.init(view,model);
}