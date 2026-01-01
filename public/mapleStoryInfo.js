// const response = await fetch('https://open.api.nexon.com/maplestory/v1/character/list',{headers: {'x-nxopen-api-key':API_KEY}});

let GLOBAL_API_KEY = ""; 

async function authenticateAndLoad() {
    const keyInput = document.getElementById('apiKeyInput').value.trim();
    if (!keyInput) return alert("API 키를 입력하세요.");

    GLOBAL_API_KEY = keyInput;

    try {
        // 동일 폴더의 characters.json 로드
        const response = await fetch('https://open.api.nexon.com/maplestory/v1/character/list',{headers: {'x-nxopen-api-key':GLOBAL_API_KEY}});
        const data = await response.json();
        // 계정 데이터 경로 탐색
        const characters = data.account_list[0].character_list; 

        const select = document.getElementById('charSelect');
        select.innerHTML = '<option value="">-- 캐릭터를 선택하세요 --</option>';
        
        // 레벨순 정렬 후 목록 추가
        characters.sort((a, b) => b.character_level - a.character_level);
        characters.forEach(char => {
            const opt = document.createElement('option');
            opt.value = char.ocid;
            opt.text = `${char.character_name} (${char.character_class} / Lv.${char.character_level}) - ${char.world_name}`;
            select.add(opt);
        });

        // UI 활성화 및 단계 전환
        document.getElementById('selectSection').style.opacity = "1";
        document.getElementById('charSelect').disabled = false;
        document.getElementById('analyzeBtn').disabled = false;
        document.getElementById('authSection').style.background = "#f0f9ff";
        alert("키 인증 성공! 캐릭터 목록을 불러왔습니다.");
    } catch (err) {
        alert("목록 로드 실패: " + err.message + "\n반드시 Live Server 환경에서 실행하세요.");
    }
}

async function startAnalysis() {
    const ocid = document.getElementById('charSelect').value;
    if (!ocid) return alert("캐릭터를 선택하세요.");

    const body = document.getElementById('equipBody');
    body.innerHTML = "<tr><td colspan='4' style='text-align:center;'>데이터 로딩 중...</td></tr>";

    try {
        // 기본 정보와 장비 정보를 동시에 요청
        const [basicRes, equipRes] = await Promise.all([
            fetch(`https://open.api.nexon.com/maplestory/v1/character/basic?ocid=${ocid}`, {
                headers: { 'x-nxopen-api-key': GLOBAL_API_KEY }
            }),
            fetch(`https://open.api.nexon.com/maplestory/v1/character/item-equipment?ocid=${ocid}`, {
                headers: { 'x-nxopen-api-key': GLOBAL_API_KEY }
            })
        ]);

        const basicData = await basicRes.json();
        const equipData = await equipRes.json();

        if (basicData.error) throw new Error(basicData.error.message || "API 호출 실패");

        // 상단 정보 업데이트
        document.getElementById('headerCard').style.display = 'block';
        document.getElementById('charTitle').innerText = `${basicData.character_name} (${basicData.character_class})`;
        document.getElementById('charSubInfo').innerText = `${basicData.world_name} | Lv.${basicData.character_level}`;

        renderEquip(equipData.item_equipment);
    } catch (err) {
        alert("분석 실패: " + err.message);
        body.innerHTML = "";
    }
}

function renderEquip(items) {
    const body = document.getElementById('equipBody');
    body.innerHTML = "";
    document.getElementById('equipTable').style.display = 'table';
    
    if (!items || items.length === 0) {
        body.innerHTML = "<tr><td colspan='5' style='text-align:center;'>장착 장비가 없습니다.</td></tr>";
        return;
    }

    items.forEach(item => {
        // 1. 잠재능력 등급 및 옵션 (보내주신 JSON 구조 반영)
        // 등급 필드에서 'item_'을 제거해야 정확히 읽어옵니다.
        const pGrade = item.potential_option_grade; 
        const p1 = item.potential_option_1;
        const p2 = item.potential_option_2;
        const p3 = item.potential_option_3;

        // 2. 에디셔널 등급 및 옵션
        const aGrade = item.additional_potential_option_grade;
        const a1 = item.additional_potential_option_1;
        const a2 = item.additional_potential_option_2;
        const a3 = item.additional_potential_option_3;

        // 잠재능력 HTML 생성
        let potentialHTML = `<span class="grade ${pGrade || ''}">${pGrade || '없음'}</span>`;
        if (p1) {
            potentialHTML += `
                <span class="opt-text">${p1}</span>
                ${p2 ? `<span class="opt-text">${p2}</span>` : ""}
                ${p3 ? `<span class="opt-text">${p3}</span>` : ""}
            `;
        }

        // 에디셔널 HTML 생성
        let additionalHTML = `<span class="grade ${aGrade || ''}">${aGrade || '없음'}</span>`;
        if (a1) {
            additionalHTML += `
                <div class="add-opt-box">
                    <span class="opt-text">${a1}</span>
                    ${a2 ? `<span class="opt-text">${a2}</span>` : ""}
                    ${a3 ? `<span class="opt-text">${a3}</span>` : ""}
                </div>
            `;
        }

        const itemIcon = item.item_icon ? `<img src="${item.item_icon}" style="width:30px; vertical-align:middle; margin-right:5px;">` : "";

        body.innerHTML += `
            <tr>
                <td>${item.item_equipment_part}</td>
                <td>${itemIcon}<strong>${item.item_name}</strong></td>
                <td class="starforce">${item.starforce !== "0" ? item.starforce + '★' : '-'}</td>
                <td>${potentialHTML}</td>
                <td>${additionalHTML}</td>
            </tr>`;
    });
}