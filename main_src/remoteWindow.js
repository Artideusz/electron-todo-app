const { remote } = require('electron');

//All remote windows will disable the main window

module.exports = {
    createBasicWindow({url='index.html', width=800, height=600, template=null, frame=true, node=true, aot=false, show=true}={}){
        let x =  new remote.BrowserWindow({
            width:width,
            height:height,
            frame:frame,
            alwaysOnTop : aot,
            webPreferences :{
                nodeIntegration : node
            },
            show : show,
            parent : remote.getCurrentWindow(),
            modal : true
        })
        x.loadFile(url);
        if(template === 'none'){
            x.setMenu(null);
        }else if(template){
            let menu = remote.Menu.buildFromTemplate(template);
            x.setMenu(menu);
        }
        return x;
    }
}