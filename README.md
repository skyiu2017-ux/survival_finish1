# 붉은 눈(雪) — 1945, 아르덴 생존 기록

중학교 세계사 복습용 로그라이크 생존 게임입니다.

## 학생용 게임 링크

**https://skyiu2017-ux.github.io/survival_finish1/**

> 위 링크는 저장소 소유자가 GitHub Pages를 처음 활성화한 뒤 작동합니다.

## 최초 GitHub Pages 활성화 (교사용, 한 번만)

1. [이 저장소](https://github.com/skyiu2017-ux/survival_finish1)에서 **Settings** 탭을 엽니다.
2. 왼쪽 메뉴 **Pages**를 클릭합니다.
3. **Build and deployment → Source → GitHub Actions**를 선택합니다.
4. **Actions** 탭에서 **Publish Red Snow game**을 선택하고, **Run workflow**(또는 실패한 실행의 **Re-run jobs**)로 배포를 다시 실행합니다.
5. 배포 작업이 성공한 뒤 위 학생용 링크를 열어 확인합니다.

`index.html`이 게임 본문이며, `.github/workflows/deploy-pages.yml`이 main 브랜치 업데이트 시 자동 배포합니다.

## 게임 및 랭킹

- 플레이 기간: 1945년 1월 29일 ~ 5월 8일, 최대 100일 생존
- 사망하면 다시 시작하는 로그라이크 방식, 게임 종료 시 기록 자동 등록
- 순위: **생존 일수 → 누적 획득 지식 → 종료 시 남은 식량 → 종료 시 남은 물자**, 높은 순
- 학급 공용 랭킹은 게임에 입력된 Google Apps Script 웹 앱과 별도로 연결됩니다. GitHub Pages 자체는 랭킹 저장 서버가 아닙니다.
- 학생의 실명·학번 대신 **교사가 배부한 별명이나 익명 코드**를 사용하세요.
- 공개 웹페이지의 게임 기록은 브라우저에서 변조될 수 있습니다. 공식 수행평가나 고부담 성적 산출에는 별도 검증 없이 사용하지 마세요.

## 유지관리

게임 수정 시 `index.html`을 업데이트하면 GitHub Actions가 자동으로 웹사이트를 재배포합니다.
