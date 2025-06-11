# Schello 🗂️

카카오톡 연동 기반 할 일 관리 웹 애플리케이션  
단기 3주 팀 프로젝트로 개발되었습니다.

---

## 🔧 기술 스택

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Django (Python)
- **Database**: MySQL
- **OAuth**: Kakao 로그인 API
- **Version Control**: Git, GitHub

---

## 📌 주요 기능

- ✅ 카카오 계정 로그인 및 자동 회원가입, 로그아웃 기능
- ✅ 프로필 페이지에서 사용자 이메일 확인, 프로필 사진 변경
- ✅ 할 일(TODO) 등록, 수정, 삭제 기능

---

## 🚀 실행 방법

### 1. 가상환경 생성 및 실행
python3 -m venv .venv
source .venv/bin/activate

### 2. 필수 패키지 설치
pip install -r requirements.txt

### 3. mysqlclient 설치 (MAC 기준)
brew install mysql
pip install mysqlclient

### 4. mysql 설정
CREATE DATABASE schello DEFAULT CHARACTER SET utf8mb4;
CREATE USER 'minseo'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON schello.* TO 'minseo'@'localhost';

### 5. 마이그레이션 및 서버 실행
python manage.py makemigrations
python manage.py migrate
python manage.py runserver

### 6. 개발자 페이지 설정
1. 서버 실행 후 `http://localhost:8000/admin` 접속
2. 슈퍼유저 계정으로 로그인
3. https://www.notion.so/README-md-20f11f979ee280f3a8c3c4c13ce89fce

### 7. localhost:8000/ 접속

---

## 🗂️ 프로젝트 구조
<img width="526" alt="image" src="https://github.com/user-attachments/assets/953fd97d-1747-444e-9718-ee05610fdcc6" />


---

## 🗂️ 브랜치 전략

init: 모든 기능 개발이 이루어지는 메인 브랜치

feat#번호, fix#번호: 이슈 기반 기능/버그 작업 브랜치

main: 최종 제출용 브랜치

