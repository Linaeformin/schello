//카카오 프로필 사진으로 초기 프로필 이미지 설정
// const kakaoProfileImageUrl = "카카오톡 프로필 사진 URL"

// const profileImage = document.getElementById('profileImage');
// profileImage.src = kakaoProfileImageUrl;

// 프로필 사진 변경 기능 (갤러리 들어가서, 사진 선택)

const editBtn = document.getElementById('editBtn');
const fileInput = document.getElementById('fileInput');
const profileImage = document.getElementById('profileImage');

editBtn.addEventListener('click', () => {
    fileInput.click(); // 
});

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            profileImage.src = e.target.result; 
        };
        reader.readAsDataURL(file);
    }
});

//모달창 js
const logoutBtn = document.getElementById('logoutBtn');
const modal = document.getElementById('modal');
const modalCancel = document.querySelector('.modal-cancel');
const modalConfirm = document.querySelector('.modal-confirm');

logoutBtn.addEventListener('click', () => {
    modal.style.display = 'flex'; // 오버레이 띄우기
});

modalCancel.addEventListener('click', () => {
    modal.style.display = 'none'; // 닫기
});

modalConfirm.addEventListener('click', () => {
    // 여기에 "로그아웃 처리" 넣으면 됨 (예: 로그인 화면으로 이동)
    alert('로그아웃 처리!');
    modal.style.display = 'none';
});

//데이터 받아오고 불러오기
// 예시 사용자 정보 변수
document.getElementById('userName').textContent = userName;
document.getElementById('userEmail').textContent = userEmail;
document.getElementById('profileImage').src = imgUrl;



