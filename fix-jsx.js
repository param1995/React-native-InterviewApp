const fs = require("fs");
const path = require("path");

function fixJSX(filePath) {
    let content = fs.readFileSync(filePath, "utf8");
    content = content.replace(/return \( </g, "return (");
    content = content.replace(/< ([A-Z])/g, "<$1");
    content = content.replace(/< \//g, "</");
    content = content.replace(/}} >/g, "}}>");
    content = content.replace(/\/> </g, "/>");
    content = content.replace(/\/> < \//g, "/></");
    content = content.replace(/< \/View> </g, "</View>");
    content = content.replace(/< \/Text> </g, "</Text>");
    content = content.replace(/^(\s*)View style/gm, "$1<View style");
    content = content.replace(/^(\s*)Text /gm, "$1<Text ");
    content = content.replace(/^(\s*)FlatList /gm, "$1<FlatList ");
    content = content.replace(/^(\s*)Button /gm, "$1<Button ");
    content = content.replace(/^(\s*)<$/gm, "");
    content = content.replace(/\/>\/$/gm, "/>");
    content = content.replace(/View > </g, "</View>");
    content = content.replace(/Text >$/gm, "</Text>");
    content = content.replace(/const renderQuestion = \({ item, index }\) => \( </gm, "const renderQuestion = ({ item, index }) => (");
    content = content.replace(/\/Text> < </g, "/Text>");
    content = content.replace(/View > \//g, "</View>");
    content = content.replace(/View >$/gm, "</View>");
    content = content.replace(/<\/Text> < </g, "</Text>");
    content = content.replace(/keyExtractor=\(\(q, i\) => String\(i\)\)$/gm, "keyExtractor={(q, i) => String(i)}");
    content = content.replace(/}\s*renderItem=/g, "}\n        renderItem=");
    content = content.replace(/style = {\s*{\s*/g, "style={{");
    content = content.replace(/}} >/g, "}}>");
    content = content.replace(/}} > ([^<]*) < \/Text>/g, "}}>$1</Text>");
    content = content.replace(/FlatList data = {\s*/g, "FlatList data={");
    content = content.replace(/keyExtractor = {\s*/g, "keyExtractor={");
    content = content.replace(/renderItem = {\s*/g, "renderItem={");
    content = content.replace(/onPress = {\s*/g, "onPress={");
    content = content.replace(/placeholder = "/g, 'placeholder="');
    content = content.replace(/value = {\s*/g, "value={");
    content = content.replace(/onChangeText = {\s*/g, "onChangeText={");
    content = content.replace(/title = "/g, 'title="');
    content = content.replace(
        /secureTextEntry value = {\s*/g,
        "secureTextEntry value={"
    );
    content = content.replace(/(\w+) = {\s*(\w+)\s*}/g, "$1={$2}");
    content = content.replace(/\{\s*" "\s*\}/g, "");
    content = content.replace(/\{\" \"\}/g, "");
    content = content.replace(/\{\s*"\s*"\s*\}/g, "");
    content = content.replace(/^(\s*)< ([A-Z])/gm, "$1<$2");
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${filePath}`);
}
const files = [
    "src/screens/Signup.js",
    "src/screens/AdminDashboard.js",
    "src/screens/CreateInterview.js",
    "src/screens/CandidateDashboard.js",
    "src/screens/RecordAnswer.js",
    "src/screens/ReviewerDashboard.js",
    "src/screens/ReviewSubmission.js",
];
files.forEach(fixJSX);