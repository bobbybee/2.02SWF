function GetInflatedFile(f){
    return process.argv[2]+".esb2/"+f;
}

function GenerateAS3Code(){
   // return "package{\n  import flash.display.Sprite;\n\n    public class "+process.argv[2]+" extends Sprite{\n      //variables here\n\n        public function "+process.argv[2]+"():void {\n          //stuff\n       }\n     }\n}";
    return "package{\n\
        import flash.display.Sprite;\n\
        \n\
        public class "+process.argv[2]+" extends Sprite{\n\
                //variables here\n\n\
                public function "+process.argv[2]+"():void {\n\
                            //stuff\n\
                }\n\
        }\n\
}";

}

var fs = require('fs');
var projJSON = JSON.parse(fs.readFileSync(GetInflatedFile("project.json")).toString());
console.log(GenerateAS3Code());