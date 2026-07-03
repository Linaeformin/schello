# Schello 🗂️

Kakao OAuth 로그인 기반 TODO 관리 웹 애플리케이션입니다.  
사용자는 카카오 계정으로 로그인하고, 개인 TODO 일정을 등록·조회·수정·삭제할 수 있습니다.

본 프로젝트는 3주 단기 팀 프로젝트로 개발되었습니다.

---

## 📆 개발 기간

2025.05.22 ~ 2025.06.13

---

## 🔧 기술 스택

| 분야 | 기술 |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, Django |
| Database | MySQL |
| Authentication | Kakao OAuth, django-allauth |
| Version Control | Git, GitHub |

---

## 📌 주요 기능

- 카카오 계정 기반 회원가입/로그인
- 최초 로그인 시 자동 회원가입
- 로그아웃
- TODO 일정 등록, 조회, 수정, 삭제
- TODO 완료 상태 변경
- 사용자 이메일 및 프로필 정보 조회
- 프로필 사진 변경
- 스플래시 화면 및 바텀 네비게이션 연결

---

## 👩‍💻 담당 역할 [김민서]

- Django 프로젝트 초기 구조 설계 및 생성
- Kakao OAuth 회원가입/로그인 구현
- django-allauth User 모델과 서비스 내부 Member 모델 연결
- 카카오 계정 기반 사용자 정보 출력
- 프로필 사진 변경 기능 구현
- TODO 일정 조회, 수정, 삭제 기능 구현
- GitHub Issue / Branch 기반 협업 방식 정리
- 잘못 푸시된 코드 revert 및 브랜치 경로 문제 해결
- README 작성 및 최종 점검

---

## 📡 주요 URL

| 기능 | URL |
|---|---|
| 스플래시 화면 | `/` |
| 카카오 로그인 | `/accounts/kakao/login/` |
| 일정 관리 | `/home/` |
| 프로필 | `/accounts/profile/` |

---

## 🗂️ 프로젝트 구조

```text
schello/
├── accounts/
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   └── templates/
├── home/
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   └── templates/
├── schello/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── static/
├── media/
├── templates/
├── manage.py
└── requirements.txt
```

---

## 🚀 실행 방법

### 1. 프로젝트 클론

```bash
git clone [repository-url]
cd [project-directory]
```

### 2. 가상환경 생성 및 실행

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Windows 환경에서는 아래 명령어를 사용합니다.

```bash
.venv\Scripts\activate
```

### 3. 패키지 설치

```bash
pip install -r requirements.txt
```

### 4. mysqlclient 설치

macOS 기준입니다.

```bash
brew install mysql
pip install mysqlclient
```

### 5. MySQL 데이터베이스 생성

```sql
CREATE DATABASE schello DEFAULT CHARACTER SET utf8mb4;

CREATE USER 'schello_user'@'localhost' IDENTIFIED BY 'your_password';

GRANT ALL PRIVILEGES ON schello.* TO 'schello_user'@'localhost';

FLUSH PRIVILEGES;
```

### 6. 마이그레이션 실행

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. 슈퍼유저 생성

```bash
python manage.py createsuperuser
```

### 8. 서버 실행

```bash
python manage.py runserver
```

### 9. 접속

```text
http://localhost:8000/
```

---

## ⚙️ Kakao Developers 설정

Kakao OAuth 로그인을 위해 Kakao Developers에서 아래 설정이 필요합니다.

- 애플리케이션 생성
- 플랫폼 Web 등록
- 사이트 도메인 등록

```text
http://localhost:8000
```

- Redirect URI 등록

```text
http://localhost:8000/accounts/kakao/login/callback/
```

- 동의 항목 설정
  - 프로필 정보
  - 카카오계정 이메일

---

## 🤝 브랜치 전략

| 브랜치 | 설명 |
|---|---|
| `init` | 기능 개발 브랜치 |
| `feat#번호` | 이슈 기반 기능 개발 브랜치 |
| `fix#번호` | 이슈 기반 버그 수정 브랜치 |
| `main` | 최종 제출 브랜치 |

---

## 💡 배운 점

- Django MTV 패턴 기반의 서버 사이드 렌더링 구조를 경험했습니다.
- Kakao OAuth 로그인 흐름을 구현하며 외부 인증 과정을 이해했습니다.
- django-allauth와 서비스 내부 사용자 모델을 연결하는 방법을 학습했습니다.
- GitHub Issue와 Branch를 활용한 팀 협업 방식을 경험했습니다.

---

## 🔜 개선 방향

- TODO 마감일 및 우선순위 기능 추가
- 완료 / 미완료 TODO 필터링 기능 추가
- 카카오톡 메시지 API를 활용한 TODO 알림 기능 추가
- 반응형 UI 개선
- AWS 배포 환경 구성
