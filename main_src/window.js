const { BrowserWindow, Menu } = require('electron');

module.exports = {
    createBasicWindow({url='index.html', width=800, height=600, template=null, frame=true, node=true, aot=false, show=true,parentWindow=null}={}){
        let x =  new BrowserWindow({
            width:width,
            height:height,
            frame:frame,
            alwaysOnTop : aot,
            webPreferences :{
                nodeIntegration : node
            },
            show : show,
            parent:(parentWindow)?parentWindow:null,
            modal:(parentWindow)?true:false
        })
        x.loadFile(url);
        if(template === 'none'){
            x.setMenu(null);
        }else if(template){
            let menu = Menu.buildFromTemplate(template);
            x.setMenu(menu);
        }
        return x;
    }
}