# 배포 가이드 — 이야기 동화관

이 문서는 이야기 동화관 웹 앱을 Netlify에 배포하는 방법을 단계별로 설명합니다.

---

## 방법 1: GitHub + Netlify 자동 배포 (권장)

GitHub에 코드를 push하면 Netlify가 자동으로 빌드하고 배포합니다.

### 1단계: GitHub 저장소 생성

```bash
git init
git add .
git commit -m "초기 커밋"
git remote add origin https://github.com/YOUR_ID/story-to-storybook.git
git push -u origin main
```

### 2단계: Netlify에서 GitHub 연결

1. [Netlify](https://netlify.com)에 로그인 (GitHub 계정으로 무료 가입 가능)
2. **"Add new site"** → **"Import an existing project"** 클릭
3. **"GitHub"** 선택 → 저장소 선택
4. 빌드 설정 확인 (자동으로 `netlify.toml`을 읽어 설정됨):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. **"Deploy site"** 클릭

### 3단계: 배포 완료

배포가 완료되면 `https://랜덤이름.netlify.app` 주소가 생성됩니다.
이 주소를 팀원들과 공유하면 바로 사용할 수 있습니다.

---

## 방법 2: Netlify CLI로 직접 배포

### 사전 준비

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# Netlify 계정으로 로그인
netlify login
```

### 첫 배포

```bash
# 프로젝트 빌드
npm run build

# Netlify에 배포 (프리뷰 - 링크 확인용)
netlify deploy

# 프로덕션 배포 (실제 사이트에 반영)
netlify deploy --prod
```

### 이후 업데이트

```bash
npm run build && netlify deploy --prod
```

---

## 방법 3: Windows 배포 스크립트 사용

`deploy.bat` 파일을 더블클릭하면 자동으로 빌드 후 배포합니다.

```bat
@echo off
echo === 이야기 동화관 빌드 및 배포 ===
echo.

echo [1/2] 빌드 중...
call npm run build
if errorlevel 1 (
    echo 빌드 실패! 오류를 확인하세요.
    pause
    exit /b 1
)

echo [2/2] 배포 중...
call netlify deploy --prod
if errorlevel 1 (
    echo 배포 실패! 오류를 확인하세요.
    pause
    exit /b 1
)

echo.
echo === 배포 완료! ===
pause
```

> `deploy.bat` 파일이 없다면 위 내용을 복사하여 프로젝트 루트에 저장하세요.

---

## 로컬 개발 환경 설정

```bash
# 1. 의존성 설치
npm install

# 2. Netlify CLI 설치
npm install -g netlify-cli

# 3. 개발 서버 시작 (Netlify Functions 포함)
netlify dev
```

브라우저에서 `http://localhost:8888` 접속

---

## 커스텀 도메인 연결 (선택)

1. Netlify 사이트 관리 페이지 → **"Domain settings"**
2. **"Add custom domain"** 클릭
3. 도메인 입력 후 DNS 설정 (도메인 등록 업체에서 CNAME 레코드 추가)

---

## 주의사항

- Netlify 무료 플랜은 **월 100GB 대역폭**, **서버리스 함수 125,000회/월** 제공
- 이미지 생성은 사용자 본인의 Gemini API 키를 사용하므로 서버 비용 없음
- API 키는 사용자 브라우저에만 저장되어 서버로 전달되지 않음 (보안 안전)

---

*배포 중 문제가 발생하면 README.md의 "문제 발생 시 대처 방법"을 참고하세요.*
