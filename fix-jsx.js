const fs = require("fs");
const path = require("path");

function fixJSX(filePath) {
    let content = fs.readFileSync(filePath, "utf8");

    // Comprehensive fix for all malformed JSX patterns
    // Remove all extra spaces and fix JSX formatting

    // Fix return ( < to return (
    content = content.replace(/return \( </g, "return (");

    // Fix all JSX opening tags with spaces
    content = content.replace(/< ([A-Z])/g, "<$1");

    // Fix all JSX closing tags with spaces
    content = content.replace(/< \//g, "</");

    // Fix all }} > to }}>
    content = content.replace(/}} >/g, "}}>");

    // Fix all /> < to />
    content = content.replace(/\/> </g, "/>");

    // Fix all /> < / to /></
    content = content.replace(/\/> < \//g, "/></");

    // Fix all < /View> < to </View>
    content = content.replace(/< \/View> </g, "</View>");

    // Fix all < /Text> < to </Text>
    content = content.replace(/< \/Text> </g, "</Text>");

    // Fix missing < before View
    content = content.replace(/^(\s*)View style/gm, "$1<View style");

    // Fix missing < before Text
    content = content.replace(/^(\s*)Text /gm, "$1<Text ");

    // Fix missing < before FlatList
    content = content.replace(/^(\s*)FlatList /gm, "$1<FlatList ");

    // Fix missing < before Button
    content = content.replace(/^(\s*)Button /gm, "$1<Button ");

    // Fix extra < on its own line
    content = content.replace(/^(\s*)<$/gm, "");

    // Fix />/ to />
    content = content.replace(/\/>\/$/gm, "/>");

    // Fix View > < to </View>
    content = content.replace(/View > </g, "</View>");

    // Fix Text > to </Text>
    content = content.replace(/Text >$/gm, "</Text>");

    // Fix extra < in renderQuestion
    content = content.replace(/const renderQuestion = \({ item, index }\) => \( </gm, "const renderQuestion = ({ item, index }) => (");

    // Fix extra < after /Text>
    content = content.replace(/\/Text> < </g, "/Text>");

    // Fix View > / to </View>
    content = content.replace(/View > \//g, "</View>");

    // Fix View > to </View>
    content = content.replace(/View >$/gm, "</View>");

    // Fix extra < after </Text>
    content = content.replace(/<\/Text> < </g, "</Text>");

    // Fix keyExtractor missing }
    content = content.replace(/keyExtractor=\(\(q, i\) => String\(i\)\)$/gm, "keyExtractor={(q, i) => String(i)}");

    // Fix renderItem missing {
    content = content.replace(/}\s*renderItem=/g, "}\n        renderItem=");

    // Fix all style = { to style={{
    content = content.replace(/style = {\s*{\s*/g, "style={{");

    // Fix all }} > to }}>
    content = content.replace(/}} >/g, "}}>");

    // Fix all }} > text < /Text> to }}>text</Text>
    content = content.replace(/}} > ([^<]*) < \/Text>/g, "}}>$1</Text>");

    // Fix all FlatList data = { to FlatList data={
    content = content.replace(/FlatList data = {\s*/g, "FlatList data={");

    // Fix all keyExtractor = { to keyExtractor={
    content = content.replace(/keyExtractor = {\s*/g, "keyExtractor={");

    // Fix all renderItem = { to renderItem={
    content = content.replace(/renderItem = {\s*/g, "renderItem={");

    // Fix all onPress = { to onPress={
    content = content.replace(/onPress = {\s*/g, "onPress={");

    // Fix all placeholder = " to placeholder="
    content = content.replace(/placeholder = "/g, 'placeholder="');

    // Fix all value = { to value={
    content = content.replace(/value = {\s*/g, "value={");

    // Fix all onChangeText = { to onChangeText={
    content = content.replace(/onChangeText = {\s*/g, "onChangeText={");

    // Fix all title = " to title="
    content = content.replace(/title = "/g, 'title="');

    // Fix all secureTextEntry value = { to secureTextEntry value={
    content = content.replace(
        /secureTextEntry value = {\s*/g,
        "secureTextEntry value={"
    );

    // Remove extra spaces in JSX attributes
    content = content.replace(/(\w+) = {\s*(\w+)\s*}/g, "$1={$2}");

    // Remove {" "} expressions that create whitespace nodes
    content = content.replace(/\{\s*" "\s*\}/g, "");
    content = content.replace(/\{\" \"\}/g, "");
    content = content.replace(/\{\s*"\s*"\s*\}/g, "");

    // Fix lines starting with < followed by space and capital letter
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