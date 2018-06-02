{
    let view={
        el:'.page-3',
        init(){
            this.$el = $(this.el)
        },
        $el:$(this.el),
        show(){
            this.$el.addClass('active')
        },
        hide(){
            this.$el.removeClass('active')
        },
        render(songs){
            songs.forEach((song) => {
                let $li = `
                <li id="${song.id}" class="item-common">
                        <div class="song-info">
                            <p class="song">${song.name}</p>
                            <p class="singer">
                                <svg class="SQsvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="#FE672E">
                                    <path d="M537.456788 684.682921l198.722994 0 18.48398 18.023492c5.709025 5.565762 13.102413 8.336876 20.490683 8.336876 7.636934 0 15.266705-2.962471 21.018709-8.859785 11.317767-11.607362 11.083429-30.191626-0.522909-41.509393l-17.499559-17.063631L778.150686 373.540532c0-16.210193-13.143345-29.352515-29.353538-29.352515L537.456788 344.188017c-16.210193 0-29.352515 13.143345-29.352515 29.352515l0 281.788851C508.104273 671.539576 521.246595 684.682921 537.456788 684.682921zM566.810327 402.893047l152.634306 0L719.444633 586.367755l-2.808976-2.739391c-11.611455-11.317767-30.193673-11.081383-41.509393 0.522909-11.317767 11.607362-11.083429 30.191626 0.522909 41.509393l0.323365 0.315178L566.810327 625.975844 566.810327 402.893047z"></path>
                                    <path d="M220.442668 625.976868c-16.210193 0-29.352515 13.143345-29.352515 29.353538s13.143345 29.352515 29.352515 29.352515l211.342406 0c16.210193 0 29.352515-13.143345 29.352515-29.352515L461.137589 514.433422c0-16.210193-13.143345-29.353538-29.352515-29.353538L249.796206 485.079884l0-82.187861 181.989891 0c16.210193 0 29.352515-13.143345 29.352515-29.352515 0-16.210193-13.143345-29.352515-29.352515-29.352515L220.442668 344.186993c-16.210193 0-29.352515 13.143345-29.352515 29.352515l0 140.893914c0 16.210193 13.143345 29.352515 29.352515 29.352515l181.989891 0 0 82.189907L220.442668 625.975844z"></path>
                                    <path d="M933.722904 236.364289 88.354304 236.364289c-13.508665 0-24.461111 10.952446-24.461111 24.461111L63.893192 768.045537c0 13.508665 10.952446 24.461111 24.461111 24.461111l845.367577 0c13.508665 0 24.461111-10.952446 24.461111-24.461111L958.182992 260.824377C958.182992 247.315712 947.230546 236.364289 933.722904 236.364289zM909.261793 743.584426 112.815415 743.584426 112.815415 285.285488l796.446377 0L909.261793 743.584426z"></path>
                                </svg>
                                ${song.singer}
                            </p>
                        </div>
                        <div class="playsvg">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="#AAAAAA">
                                <path d="M512 0C229.376 0 0 229.376 0 512S229.376 1024 512 1024c282.616633 0 512-229.376 512-512S794.616633 0 512 0z m0 984.528115c-247.292317 0-472.528115-225.228432-472.528115-472.528115S264.707683 39.471885 512 39.471885s472.528115 225.228432 472.528115 472.528115-225.235799 472.528115-472.528115 472.528115z"></path>
                                <path d="M408.524432 311.185496l302.757755 201.838504-302.757755 201.838504z"></path>
                                <path d="M408.524432 725.912863a11.065094 11.065094 0 0 1-11.05036-11.050359V311.185496a11.05036 11.05036 0 0 1 17.179626-9.193899L717.411453 503.822734a11.057727 11.057727 0 0 1 0 18.387798L414.653698 724.056403a11.065094 11.065094 0 0 1-6.129266 1.85646z m11.050359-394.077928v362.37813l271.787281-181.196432-271.787281-181.181698z"></path>
                            </svg>
                        </div>
                    </li>
                `
                this.$el.find('ul.song-list').html($li)
            })
        },
        renderRecommend(data){
            data.map(item=>{
                $li = $(`
                    <li>${item.name}</li>
                `)
                this.$el.find('.top-serach-sample').append($li)
            })
        },
        styleSwitch(data){
            if(data === 'show'){
                this.$el.find(".top-search").addClass('hide')
                this.$el.find(".top-search-result.hide").removeClass('hide')
            }else if(data === 'hide'){
                this.$el.find(".top-search.hide").removeClass('hide')
                this.$el.find(".top-search-result").addClass('hide')
            }
        }
    }
    let model={
        data:{
            songs:[]
        },
        searchData:{
            songs:[]
        },
        init(){
            var query = new AV.Query('Song')
            return query.find().then( res=>{
                res.forEach(item=>{
                    this.data.songs.push({
                        name:item.attributes.name
                    })
                })
                return this.data.songs
            })
        },
        getSearch(data){
            this.searchData.songs = []
            var query = new AV.Query('Song')
            query.contains('name',data)
            return query.find().then(res=>{
                res.forEach(item =>{
                    this.searchData.songs.push({
                        id:item.id,
                        singer:item.attributes.singer,
                        name:item.attributes.name
                    })
                })
                return this.searchData
            })
        }
    }
    let controller={
        init(view,model){
            this.view=view;
            this.view.init();
            this.model=model;
            this.model.init().then(data=>{
                this.view.renderRecommend(data)
            })
            this.bindEventHub()
            this.bindEvents()
        },
        bindEventHub(){
            window.eventHub.on('selectTab',(tabName)=>{
                if(tabName==='page-3'){
                    this.view.show();
                }else{
                    this.view.hide();
                }
            })
        },
        bindEvents(){
            this.view.$el.find('input#search').on('keyup',(e)=>{
                let searchWords = $(this.view.el).find('input#search').val()
                if(e.keyCode === 13){
                    searchWords = $.trim(searchWords)
                    if(searchWords){
                        this.model.getSearch(searchWords).then((data)=>{
                            this.view.render(data.songs)
                            this.view.styleSwitch('show')
                        })
                    }
                }else if(!searchWords){
                    this.view.styleSwitch('hide')
                    this.view.$el.find(".clear-button").addClass('hide-btn')
                }if(searchWords){
                    this.view.$el.find(".clear-button").removeClass('hide-btn')
                }
            })
            this.view.$el.find('.top-serach-sample').on('click','li',(e)=>{
                let content = e.currentTarget.innerText
                this.view.$el.find('input#search').val(content)
                this.model.getSearch(content).then((data)=>{
                    this.view.render(data.songs)
                    this.view.styleSwitch('show')
                    this.view.$el.find(".clear-button").removeClass('hide-btn')
                })
            })
            this.view.$el.find('.clear-button').on('click',(e)=>{
                $(this.view.el).find('input#search').val('')
                this.view.styleSwitch('hide')
                this.view.$el.find(".clear-button").addClass('hide-btn')
            })
        }
    }
    controller.init(view,model)
}