var fs = require('fs');
var projJSON = JSON.parse(fs.readFileSync(GetInflatedFile("project.json")).toString());
var loadNum = -1;
var scriptNum = -1;

var keyboardHandlerCode = "";


console.log(GenerateAS3Code()); // TO DO: Output this code to an appropiately named file


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

function PathStringify(path){
    var ret = path.replace('.','DOT');
    ret = ret.replace('png','PNG');
    ret = ret.replace('svg','SVG');
    ret = ret.replace('wav','WAV');
    ret = ret.replace('1','one');
    ret = ret.replace('2','two');
    ret = ret.replace('3','three');
    ret = ret.replace('4','four');
    ret = ret.replace('5','five');
    ret = ret.replace('6','six');
    ret = ret.replace('7','seven');
    ret = ret.replace('8','eight');
    ret = ret.replace('9','nine');
    ret = ret.replace('0','zero');

    return ret;
}

function GenAssetEmbedCode(assetName,prefix){
    if(typeof(prefix)==='undefined') prefix = "";
    return prefix+"[Embed (source=\""+assetName+"\")]\n"+prefix+"public static const "+PathStringify(assetName)+":Class;\n";
}

function GenAssetLoadCode(path, spr, prefix){
    if(typeof(prefix)==='undefined') prefix = "";
    loadNum++;
    var retVal = prefix+"var loader"+loadNum+":Loader = new Loader();\n"+prefix+"loader"+loadNum+".contentLoaderInfo.addEventListener(Event.COMPLETE, function(e:Event){ \n"+prefix+"       "+spr+".beginBitmapFill(e.target.content.bitmapData);\n"+prefix+"       "+spr+".drawRect(0,0,e.target.content.bitmapData.width,e.taregt.content.bitmapData.height);\n"+prefix+"       "+spr+".endFill();\n"+prefix+"});\n"+prefix+"loader"+loadNum+".load(new URLRequest(\""+path+"\"));\n";
    return retVal;
}

function ReloadCostume(sprID, sprObj, prefix){
    var retStr = "getDefinitionByName(spritesData[\""+sprID+"\"].costumes[spritesData[\""+sprID+"\"].costumeNum])";
    retStr += prefix+"sprites[\""+sprID+"\"] = new getDefinitionByName(spritesData[\""+sprID+"\"].costumes[spritesData[\""+sprID+"\"].costumeNum]);\n";
    retStr += prefix+"sprites[\""+sprID+"\"].x = sprites[\""+sprID+"\"].x-spritesData[\""+sprID+"\"].rotationCenterX+240"/*+parseInt((sprObj.scratchX-sprObj.costumes[sprObj.currentCostumeIndex].rotationCenterX)+240)*/+";\n";
    retStr += prefix+"sprites[\""+sprID+"\"].y = sprites[\""+sprID+"\"].x-spritesData[\""+sprID+"\"].rotationCenterX+240"/*+parseInt((sprObj.scratchY-sprObj.costumes[sprObj.currentCostumeIndex].rotationCenterY)+180)*/+";\n";
    return retStr;
}

function NextCostumeCode(sprID, sprObj, prefix){
   var retVal = prefix+"spritesData[\""+sprID+"\"].costumeNum++;\n"+prefix+"if(spritesData[\""+sprID+"\"].costumeNum == spritesData[\""+sprID+"\"].costumeMax) spritesData[\""+sprID+"\"].costumeNum = 0;\n"+ReloadCostume(sprID, sprObj, prefix);
   return retVal; 
}



function GenerateScriptAS3(scr,sprID,sprObj){
    scriptNum++;
    var retVal = "                function Script"+parseInt(scriptNum)+"(sprID:String){\n";
    var rscr = scr[2];
    var i = 0;
    while(i < rscr.length){
        switch(rscr[i][0]){ // block name, pretty much
            case "whenKeyPressed":
                // add keyboard handler
                var sensedKeyCode = rscr[i][1];
                if(sensedKeyCode == "space") sensedKeyCode = " ";
                keyboardHandlerCode += "                    if(e.charCode == (\""+sensedKeyCode+"\").charCodeAt(0)){\n                      Script"+parseInt(scriptNum)+"(\""+sprID+"\");\n                    }\n";
                break;
            case "nextCostume":
                retVal += NextCostumeCode(sprID,sprObj,"                    ");
                //retVal += "                    trace(\"I wanna go to the next costume :P\");\n";
                break;
        }
        ++i;
    }
    retVal += "                }\n";
    return retVal;
}

function GenerateSpriteConstructor(sprObj){
     var myID = SpaceAlt(sprObj.objName);
     var retStr = "                   sprites[\""+myID+"\"] = new "+PathStringify(ComputeAssetName(sprObj.costumes[sprObj.currentCostumeIndex]))+"();\n";
     //retStr += GenAssetLoadCode(ComputeAssetName(sprObj.costumes[0]),"sprites[\""+myID+"\"]","                   ");
     retStr += "                   sprites[\""+myID+"\"].x = "+(parseInt(sprObj.scratchX)+240-sprObj.costumes[sprObj.currentCostumeIndex].rotationCenterX)+";\n";
     retStr += "                   sprites[\""+myID+"\"].y = "+(parseInt(sprObj.scratchY)+180-sprObj.costumes[sprObj.currentCostumeIndex].rotationCenterY)+";\n";
     retStr += "                   spritesData[\""+myID+"\"] = new Object();\n";
     retStr += "                   spritesData[\""+myID+"\"].costumeNum = "+sprObj.currentCostumeIndex+";\n";
     retStr += "                   spritesData[\""+myID+"\"].costumeMax = "+sprObj.costumes.length+";\n";
     retStr += "                   spritesData[\""+myID+"\"].rotationCenterX = "+sprObj.costumes[sprObj.currentCostumeIndex].rotationCenterX+";\n";
     retStr += "                   spritesData[\""+myID+"\"].rotationCenterY = "+sprObj.costumes[sprObj.currentCostumeIndex].rotationCenterY+";\n";
     retStr += "                   spritesData[\""+myID+"\"].costumes = [";
     var i = 0;
     while(i < sprObj.costumes.length){
        retStr += "\""+PathStringify(ComputeAssetName(sprObj.costumes[i]))+"\",";
        ++i;
     }
     retStr = retStr.slice(0, -1);
     retStr += "];\n";
     retStr += "                   addChild(sprites[\""+myID+"\"]);\n";
     return retStr;
}

function GenerateBackgroundConstructor(){
    var retStr = "                   background = new "+PathStringify(ComputeAssetName(projJSON.costumes[projJSON.currentCostumeIndex]))+"();\n";
    retStr += "                   background.x = 0;\n                   background.y = 0;\n                   addChild(background);\n";
    return retStr;
}

function GenerateMainConstructor(){
    var retStr = "\n                   stage.addEventListener(KeyboardEvent.KEY_DOWN, KeyDownHandler);\n";
    retStr += GenerateBackgroundConstructor();
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
        import flash.events.Event;\n\
        import flash.events.KeyboardEvent;\n\
        import flash.utils.getDefinitionByName;\n\
        \n\
        [SWF(width='480', height='360', backgroundColor='#ffffff', frameRate='30')]\n\
        \n\
        public class "+process.argv[2]+" extends Sprite{\n";
    var i = 0;
    while(i < projJSON.children.length){
        var j = 0;
        while(j < projJSON.children[i].costumes.length){
            retVal += GenAssetEmbedCode(ComputeAssetName(projJSON.children[i].costumes[j]), "                ");
            ++j;
        }
        ++i;
    }
    i = 0;
    while(i < projJSON.costumes.length){
        retVal += GenAssetEmbedCode(ComputeAssetName(projJSON.costumes[i]), "                ");
        ++i;
    }
    retVal += "\n\
                public var background;\n\
                public var sprites:Object = new Object();\n\
                public var spritesData:Object = new Object();\n\
                \n";
    i = 0;
    j = 0;
    while(i < projJSON.children.length){
        while(j < projJSON.children[i].scripts.length){
             retVal += GenerateScriptAS3(projJSON.children[i].scripts[j],SpaceAlt(projJSON.children[i].objName),projJSON.children[i]);
             ++j;
        }
        ++i;
    }
    retVal += "\n\
                public function KeyDownHandler(e:KeyboardEvent):void{\n";
    retVal += keyboardHandlerCode;
    retVal += "\
                }\n\
                \n\
                public function "+process.argv[2]+"():void {";
    retVal += GenerateMainConstructor();
    retVal += "\
        }\n\
}";
    return retVal;

}

