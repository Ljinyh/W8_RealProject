# 🍚 맛집 공유 히스토리 플랫폼, 위잇 (WEat) 🍔

## ⛏개발환경 | Development Enviornment

#### Language
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

#### Framework
![NPM](https://img.shields.io/badge/NPM-%23000000.svg?style=for-the-badge&logo=npm&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)

#### Infrastructure
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

#### DB
![MongoDB](https://img.shields.io/badge/MongoDB-47A248.svg?&style=for-the-badge&logo=MongoDB&logoColor=white)
![mongoose](https://img.shields.io/badge/Mogoose-52B0E7?style=for-the-badge&logo=Mongoose&logoColor=white)
<img alt="s3" src ="https://img.shields.io/badge/Amazon S3-569A31.svg?&style=for-the-badge&logo=Amazon S3&logoColor=white"/>
<img alt="Lambda" src ="https://img.shields.io/badge/Lambda-FF4F8B.svg?&style=for-the-badge&logo=AWS Lambda&logoColor=white"/>

#### Dev tools
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
<img src="https://img.shields.io/badge/VSCode-007ACC?style=for-the-badge&logo=Visual Studio Code&logoColor=white"/>

<br>

## 🌎웹사이트 | Website
- [위잇(WEat) http://weat.site](https://weat.site/)

<br>

## ⌚개발기간 | Project Period

- 2022.06.24 ~ 2022.08.05 (6주간)

<br>

## 목차 | Contents
1. [위잇 소개 | About WEat](#위잇-소개--About-WEat)
2. [웹사이트 | Webstie](#웹사이트--Website)
3. [주요 API 기능 | Main API](#주요-API-기능--Main-API)
4. [ERD](#ERD)
5. [개발환경 | Development Enviornment](#개발환경--Development-Enviornmentt)
6. [라이브러리 | Library](#라이브러리--Library)
7. [기술적 챌린지 | Trouble shooting](#기술적-챌린지--Trouble-shooting)
8. [백엔드 팀원 | BE TEAM](#백엔드-팀원--BE-TEAM)
9. [More Info](#More-Info)
<br>
<hr>

## 위잇 소개 | About WEat
![로고](https://xoxokss.s3.ap-northeast-2.amazonaws.com/%E1%84%8A%E1%85%A5%E1%86%B7%E1%84%82%E1%85%A6%E1%84%8B%E1%85%B5%E1%86%AF.jpeg)
<br>

### 가고 싶은 맛집! 다시 가고 싶은 맛집을 저장하고 공유할 땐?

👉 나만 알고 있던 맛집을 저장하거나 다른 사람들과 공유하고 싶으신 분 </br>
👉 지도를 통해 맛집 위치를 쉽게 저장하고 싶으신 분 </br>
👉 지인들과 같이 작성하는 진짜 맛집 리뷰를 공유하고 싶으신 분 </br>

- 위잇(WEat)은 지인들과 공유하는 맛집 히스토리 플랫폼입니다.

<br>

## ⚔주요 API 기능 | Main API 
- 지인들을 초대해서 맛집 정보를 공유하는 방 or 나만의 맛집 리스트를 저장
- 맛집 지도 (검색, 필터)
- 초대 및 맛집게시물의 실시간 알림
- 먹기록👑

<br>

## 🛠 아키텍쳐 | Architecture
![아키텍쳐 drawio](https://user-images.githubusercontent.com/105095093/182834501-d552321d-27fb-48b3-aafe-a7f974719612.png)

<br>


## ERD

![erd](https://xoxokss.s3.ap-northeast-2.amazonaws.com/_WEat+(2).png)

<br>

## 🎨라이브러리 | Library

| Name                | Appliance               | Version  |
| :-----------------: | :---------------------: | :------: |
| aws-sdk             |	아마존              |2.1166.0|
| bcrypt              |	비밀번호 암호화        |5.0.1|
| cors                | CORS 핸들링             |2.8.5|
| dotenv              | 환경변수 설정           |16.0.1|
| helmet              | HTTP header 보안        |5.1.0|
| jsonwebtoken        | JWT토큰 발급            |8.5.1|
| lodash               | 모듈성 javascript 유틸리티   |4.17.21|
| morgan              | HTTP 요청 로그 관리     |1.10.0|
| multer              | 파일 업로드             |1.4.5|
| multer-s3           | AWS S3 파일 업로드      |2.10.0|
| nomailer            | 인증 메일 발송             |6.7.5|
| multer-s3           | AWS S3 파일 업로드      |2.10.0|
| passport            | node.js authentication  |0.5.2|
| passport-kakao      | 카카오 소셜 로그인 모듈      |1.0.1|
| passport-google-oauth20      | 구글 로그인 모듈      |2.0.0|
| prettier      | 코드 서식      |2.7.1|
| socket.io      | socket.io 연결      |4.5.1|

<br>


## 🏊🏻‍♂️기술적 챌린지 | Trouble shooting

### issue1: 사용자마다 다른 상태를 보여주는 맛방의 DB 설계

#### 🙁 situation
- 처음에는 맛방(Room)의 컬렉션에 상태(status) 필드를 만들어 저장하고 표시하려 했지만 사용자마다 다른 상태를 갖는다는 것을 간과함.
- 또한 사용자마다 방 목록의 순서를 커스터마이징해서 저장할 수 있어야 함.
- 방의 상태를 사용자의 상황에 따라 3가지로 분류하여 표시하기 위한 DB 설계 필요.
1. 사용자만 "혼자"있는 비밀방
2. 사용자가 "방장"인 단체방
3. 사용자가 "게스트 멤버"인 단체방

#### 🚥 solution 
- 사용자 개인의 방 목록 순서를 지정하는 컬렉션을 별도로 만들었고, 방이 삭제되면 방 목록의 순서 컬렉션에서도 도큐먼트가 수정, 삭제되도록 구현.
- 방마다 status는 저장하지 않지만 맛방 컬렉션에는 방장과 게스트 명단을 저장하는 필드 존재. 
- 조건문을 통해 사용자가 방장인지, 게스트인지, 혼자인지 분류하여 사용자마다 각기 다른 상태를 출력할 수 있도록 구현.

---

### issue2: 사용자의 위도경도에 따라 주변 반경 20km의 맛집을 찾아서 출력하는 기능 구현
#### 🙁 situation
- 1차 스코프(1~3주차) : 맛집의 위도와 경도를 DB에 저장하기만 함.
- 2차 스코프(3주차~) : 저장된 맛집의 위도 경도를 클라이언트의 kakao API에 보여주기 위해 MongoDB를 어떻게 가공해야할지 구상 및 정보 검색.

#### 🚥 solution 
- MongoDB는 지오메트리를 위한 GeoJson 데이터형식을 지원한다는 것을 알았고, ODM인 Moogoose를 통해 데이터를 쉽게 가공할 수 있었음.
- 쿼리를 사용하여 일정 반경 내의 맛집들을 선별 출력할 수 있을 뿐 아니라, 2dsphere 인덱스를 정의하여 속도를 높일 수 있었음.
- 사용자의 2km 반경을 기준으로 출력하는 게 첫 기획이었으나, 초기 맛집 데이터의 빈약 때문에 20km 반경 범위로 확대 적용함. 
- 특정 지역에 맛집 데이터가 몰리거나, 부족할 수 있기 때문에 효율적인 반경 출력 알고리즘이 필요해 보임.

---

### issue3: 이미지 리사이징 / Lambda 실행속도 관련 이슈
#### 🙁 situation
- 사이트 맛집 리뷰에 최대 5장의 이미지가 업로드되어 고화질의 디폴트 이미지를 불러오기 때문에 이미지 소스관리 필요
- 용량이 큰 이미지들이 다수 렌더링될 때 처리시간에 대한 개선의 필요성이 부각됨

#### 🚥 solution 
#### 1) 이미지 리사이징
- 업로드된 이미지는 AWS-S3에 저장, 지정된 폴더에 이미지가 업로드될 때 이벤트 트리거를 발동시켜 Lambda의 함수가 실행되도록 연결
- 이미지 리사이징의 과정을 웹서버가 아닌 서버리스 Lambda의 함수를 통해 실행되도록 하여 웹서버 트래픽 분산
- 클라이언트에는 리사이징된 이미지가 불러와지도록 하여 처리속도 개선

#### 2) Lambda 에러 발생
#### 🙁 situation
- 큰 용량이나 다수의 이미지를 첨부하여 게시글 등록하면 리사이징 함수가 에러나는 현상 발생
- Lambda 함수의 가용메모리 증설(128MB -> 256MB), 지연시간 설정(30sec)을 적용해보았으나 에러를 수리하지 못함.

#### 🚥 solution 
- Lambda@edge라는 기능을 활용한다는 것을 서칭하였으며, 서버를 프로비저닝하고, 요청에 대한 응답으로 함수가 사용자에게 좀 더 가까운 위치(리전)에서 트리거 되도록 구성할 수 있다는 것을 확인.
- 최종 제출일에 맞춰 해결하지 못했지만 추후 적용하고자 함.

<br>

## 🤸🏻‍♀️백엔드 팀원 | BE TEAM

<br/>
<table>
   <tr>
    <td align="center" width="20%"><b>name</b></td>
    <td align="center"width="10%"><b>postion</b></td>
    <td align="center"width="40%"><b>work</b></td>
    <td align="center"width="40%"><b>Github</b></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/hyeonjun4460"><b>이진희</b></a></td>
    <td align="center">Leader</td>
    <td align="center">카카오, 구글 소셜로그인 / 이메일 인증 / 유저 프로필 정보 관리 / JWT토큰 인증관리 / 사용자 기록 데이터 분석(먹기록)/ 맛방 detail CRUD / 알림 기능(socket.io) / EC2 t3 HTTPS 서버 배포 / CICD </td>
    <td align="center">https://github.com/Ljinyh</td>

  </tr>
    <tr>
    <td align="center"><a href="https://github.com/inmyblue"><b>김상선</b></a></td>
    <td align="center">Member</td>
    <td align="center">방 생성 CRUD / 맛집 생성 CRUD / 좋아요 기능 / DB 설계 / 위도경도 데이터 가공 / 맛집 태그 검색 필터링 / S3-Lambda 이미지 리사이징 / 회의록 및 README 작성 </td>
   <td align="center">https://github.com/xoxokss</td>
  </tr>
</table>
<br/>

## 🍕More Info 
[🌿 프로젝트 소개 문서](https://www.notion.so/WEat-617066c95d3f422fb10dda696d8f1b43)  
[💾 와이어프레임 Figma](https://www.figma.com/file/W4Yr7Umu4AvKSsI19LVouG/WEat?node-id=187%3A1238)  
[🔐 Front-End Github Repo](https://github.com/jeelly/weat/) 
