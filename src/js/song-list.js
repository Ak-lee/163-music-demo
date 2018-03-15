{
    let view = {
        el:'#songList-container',
        template:`
            <ul class="songList">
                <li>歌曲1</li>
                <li>歌曲2</li>
                <li>歌曲3</li>
                <li>歌曲4</li>
                <li>歌曲5</li>
                <li>歌曲6</li>
                <li>歌曲7</li>
                <li>歌曲8</li>
            </ul>
        `,
        render(data){
            $(this.el).html(this.template)

        },
        clearActive(){
            $(this.el).find('.active').removeClass('active')
        }

    };
    let model={};
    let controller = {
        init(view,model){
            this.view = view;
            this.model=model;
            this.view.render(this.model.data);
            window.eventHub.on("upload",()=>{
                this.view.clearActive()
            })
        }
    };
    controller.init(view,model);


}