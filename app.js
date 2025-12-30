const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// public 폴더 내의 정적 파일들을 외부에서 접근 가능하게 설정
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',(req,res)=>{
    res.redirect('/mapleinfo');
})
// 기본 경로로 접속 시 index.html 전송
app.get('/mapleinfo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'myItem.html'));
});

app.listen(PORT, () => {
    console.log(`✅ 서버 실행 중: http://localhost:${PORT}/mapleinfo`);
    console.log(`💡 이제 브라우저에서 위 주소로 접속하세요.`);
});