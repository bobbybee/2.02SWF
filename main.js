var fs = require('fs');
var projJSON = JSON.parse(fs.readFileSync(GetInflatedFile("project.json")).toString());
console.log(GenerateAS3Code());

function GetInflatedFile(f){
    return process.argv[2]+".esb2/"+f;
}

function SpaceAlt(str){
    return str.replace(" ","sp");
}

function GenAssetLoadCode(path, prefix){
    if(typeof(prefix)==='undefined') prefix = "";
    var retVal = prefix+"var loader:Loader = new Loader();\n"+prefix+"loader.load(new URLRequest(\""+path+"\"));\n";
    return retVal;
}

function GenerateSpriteConstructor(sprObj){
     var myID = SpaceAlt(sprObj.objName);
     var retStr = "                   sprites[\""+myID+"\"] = new Sprite();\n";
     retStr += GenAssetLoadCode("./0.png", "                   ");
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

