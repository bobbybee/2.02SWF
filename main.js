var fs = require('fs');
var projJSON = JSON.parse(fs.readFileSync(GetInflatedFile("project.json")).toString());
var loadNum = -1;


console.log(GenerateAS3Code());


function GetInflatedFile(f){
    return process.argv[2]+".esb2/"+f;
}

function SpaceAlt(str){
    return str.replace(" ","sp");
}

function ComputeAssetName(obj){
    var type = "baseLayer";
    if(obj.costumeName === "undefined")
        type = "";
   var retVal = obj[type+"ID"];
   var thash = obj[type+"MD5"];
   retVal += thash.substr(thash.length - 4);
   return retVal;
}

function GenAssetLoadCode(path, spr, prefix){
    if(typeof(prefix)==='undefined') prefix = "";
    loadNum++;
    var retVal = prefix+"var loader"+loadNum+":Loader = new Loader();\n"+prefix+"loader"+loadNum+".contentLoaderInfo.addEventListener(Event.COMPLETE, function(e:Event){ "+spr+".beginBitmapFill(e.target.content.bitmapData);"+spr+".drawRect(0,0,e.target.content.bitmapData.width,e.taregt.content.bitmapData.height);"+spr+".endFill();});\n"+prefix+"loader"+loadNum+".load(new URLRequest(\""+path+"\"));\n";
    return retVal;
}

function GenerateSpriteConstructor(sprObj){
     var myID = SpaceAlt(sprObj.objName);
     var retStr = "                   sprites[\""+myID+"\"] = new Sprite();\n";
     retStr += GenAssetLoadCode(ComputeAssetName(sprObj.costumes[0]),"sprites[\""+myID+"\"]","                   ");
     retStr += "                   sprites[\""+myID+"\"].x = "+(parseInt(sprObj.scratchX)+240)+";\n";
     retStr += "                   sprites[\""+myID+"\"].y = "+(parseInt(sprObj.scratchY)-180)+";\n";
     retStr += "                   addChild(sprites[\""+myID+"\"]);\n";
     return retStr;
}

function GenerateMainConstructor(){
    var retStr = "\n";
    var i = 0;
    while(i < projJSON.children.length){
        retStr = retStr + GenerateSpriteConstructor(projJSON.children[i]);
        
        ++i;
    }
    retStr += "                }\n";
    return retStr;
}

function GenerateAS3Code(){
   // return "package{\n  import flash.display.Sprite;\n\n    public class "+process.argv[2]+" extends Sprite{\n      //variables here\n\n        public function "+process.argv[2]+"():void {\n          //stuff\n       }\n     }\n}";
    var retVal = "package{\n\
        import flash.display.Sprite;\n\
        \n\
        public class "+process.argv[2]+" extends Sprite{\n\
                public var sprites:Object = new Object();\n\
                \n\
                public function "+process.argv[2]+"():void {";
    retVal += GenerateMainConstructor();
    retVal += "\
        }\n\
}";
    return retVal;

}

