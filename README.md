# 🍚 맛집 공유 히스토리 플랫폼, 위잇 (WEat) 🍔

## 🔭목차 | Contents
1. [위잇 소개 | About WEat](#-위잇-소개--about-weat)
2. [웹사이트 | Website](#-웹사이트--website)
3. [개발기간 | Project Period](#-개발기간--project-period)
4. [주요 API 기능 | Main API](#-주요-api-기능--main-api)
5. [아키텍쳐 | Architecture](#-아키텍쳐--architecture)
6. [개발환경 | Development Enviornment](#-개발환경--development-environment)
7. [ERD](#-erd)
8. [라이브러리 | Library](#-라이브러리--library)
9. [기술적 챌린지 | Trouble shooting](#-기술적-챌린지--trouble-shooting)
10. [백엔드 팀원 | BE TEAM](#-백엔드-팀원--be-team)
11. [More Info](#-more-info)
<br>

## 🎉 위잇 소개 | About WEat
<img src="https://xoxokss.s3.ap-northeast-2.amazonaws.com/%E1%84%8A%E1%85%A5%E1%86%B7%E1%84%82%E1%85%A6%E1%84%8B%E1%85%B5%E1%86%AF.jpeg" width="750">

### 가고 싶은 맛집! 다시 가고 싶은 맛집을 저장하고 공유할 땐?

👉 나만 알고 있던 맛집을 저장하거나 다른 사람들과 공유하고 싶으신 분 </br>
👉 지도를 통해 맛집 위치를 쉽게 저장하고 싶으신 분 </br>
👉 지인들과 같이 작성하는 진짜 맛집 리뷰를 공유하고 싶으신 분 </br>

- 위잇(WEat)은 지인들과 공유하는 맛집 히스토리 플랫폼입니다.

<br>

## 🌎 웹사이트 | Website
- [위잇(WEat) http://weat.site](https://weat.site/)
- [발표 영상](https://youtu.be/1oy_svsfoH0)

<br>

## ⌚ 개발기간 | Project Period

- 2022.06.24 ~ 2022.08.05 (6주간)

<br>

## ⚔ 주요 API 기능 | Main API 
- 지인들과 함께 맛집 정보를 공유하는 방 or 나만의 맛집 리스트 비공개방 생성
- 맛집 지도 (맛집 검색, 태그 필터)
- 맛방 초대 및 게시물 등록의 실시간 알림
- 먹기록 (사용자 기록 인포그래프)

<img src="https://xoxokss.s3.ap-northeast-2.amazonaws.com/images/origin/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA+2022-08-05+%E1%84%8B%E1%85%A9%E1%84%8C%E1%85%A5%E1%86%AB+1.10.41.png">


<br>

## 🛠 아키텍쳐 | Architecture
<img src="https://user-images.githubusercontent.com/105095093/182834501-d552321d-27fb-48b3-aafe-a7f974719612.png" width="750">

## ⛏ 개발환경 | Development Environment

#### Language
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
#### Runtime Platform
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![NPM](https://img.shields.io/badge/NPM-%23000000.svg?style=for-the-badge&logo=npm&logoColor=white)
#### Framework
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
#### Infrastructure
![AWS](https://img.shields.io/badge/AWS-%23232F3E.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Amazon EC2](https://img.shields.io/badge/EC2-%23FF9900.svg?style=for-the-badge&logo=AmazonEC2&logoColor=white)
#### DB
![MongoDB](https://img.shields.io/badge/MongoDB-47A248.svg?&style=for-the-badge&logo=MongoDB&logoColor=white)
![mongoose](https://img.shields.io/badge/Mongoose-52B0E7?style=for-the-badge&logo=Mongoose&logoColor=white)
<img alt="s3" src ="https://img.shields.io/badge/Amazon S3-569A31.svg?&style=for-the-badge&logo=Amazon S3&logoColor=white"/>
<img alt="Lambda" src ="https://img.shields.io/badge/Lambda-FF4F8B.svg?&style=for-the-badge&logo=AWS Lambda&logoColor=white"/>
#### Dev tools
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
<img src="https://img.shields.io/badge/VSCode-007ACC?style=for-the-badge&logo=Visual Studio Code&logoColor=white"/>

<br>



## 🎨 라이브러리 | Library

| Name                | Appliance               | Version  |
| :-----------------: | :---------------------: | :------: |
| aws-sdk             |	AWS 서비스 호출             |2.1166.0|
| bcrypt              |	비밀번호 암호화              |5.0.1|
| cors                | CORS 핸들링                |2.8.5|
| dotenv              | 환경변수 설정                |16.0.1|
| helmet              | HTTP header 보안          |5.1.0|
| jsonwebtoken        | JWT토큰 발급               |8.5.1|
| lodash              | 모듈성 javascript 유틸리티  |4.17.21|
| nomailer            | 인증 메일 발송             |6.7.5|
| mongoose            | MongoDB ODM             |6.4.0|
| morgan              | HTTP 요청 로그 관리        |1.10.0|
| multer              | 파일 업로드 미들웨어         |1.4.5|
| multer-s3           | AWS S3용 multer 엔진      |2.10.0|
| passport            | node.js authentication  |0.5.2|
| passport-kakao      | 카카오 소셜 로그인 모듈       |1.0.1|
| passport-google-oauth20      | 구글 로그인 모듈   |2.0.0|
| prettier            | 코드 서식                 |2.7.1|
| socket.io           | socket.io 연결           |4.5.1|

<br>

## 🔑 ERD 

![erd](https://xoxokss.s3.ap-northeast-2.amazonaws.com/_WEat+(2).png)


<br>


## 🛠 기술적 챌린지 | Trouble shooting

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
- 조건문을 통해 사용자가 방장인지, 게스트인지, 혼자인지 분류하여 사용자마다 각각 다른 상태를 출력할 수 있도록 구현.

---

### issue2: 사용자의 위도경도에 따라 주변 반경 20km의 맛집을 찾아서 출력하는 기능 구현.
#### 🙁 situation
- 1차 스코프(1~3주차) : 맛집의 위도와 경도를 DB에 저장하기만 함.
- 2차 스코프(3주차~) : 저장된 맛집의 위도 경도를 클라이언트의 kakao API에 보여주기 위해 MongoDB를 어떻게 가공해야할지 구상 및 정보 검색.

#### 🚥 solution 
- MongoDB는 지오메트리를 위한 GeoJson 데이터형식을 지원한다는 것을 알았고, ODM인 Mongoose를 통해 데이터를 쉽게 가공할 수 있었음.
- 쿼리를 사용하여 일정 반경 내의 맛집들을 선별 출력할 수 있을 뿐 아니라, 2dsphere 인덱스를 정의하여 속도를 높일 수 있었음.
- 사용자의 2km 반경을 기준으로 출력하는 게 첫 기획이었으나, 초기 맛집 데이터의 빈약 때문에 20km 반경 범위로 확대 적용함. 
- 특정 지역에 맛집 데이터가 몰리거나, 부족할 수 있기 때문에 효율적인 반경 출력 알고리즘이 필요해 보임.

<br>

## 🤸🏻‍ 백엔드 팀원 | BE TEAM

<br/>
<table>
   <tr>
    <td align="center" width="10%"><b>name</b></td>
    <td align="center"width="10%"><b>postion</b></td>
    <td align="center"width= "60%"><b>work</b></td>
    <td align="center"width="20%"><b>Github</b></td>
  </tr>
  <tr>
    <td align="center"><b>이진희</b></a></td>
    <td align="center">Leader</td>
    <td align="left"> 
    - 카카오, 구글 소셜 로그인 <br>
    - 이메일 인증 <br>
    - 유저 프로필 정보 관리 <br> 
    - JWT토큰 인증관리 <br> 
    - 사용자 기록 데이터 분석(먹기록)<br> 
    - 맛방 detail CRUD <br> 
    - 알림 기능(socket.io) <br> 
    - EC2 t3 HTTPS 서버 배포 <br> 
    - CICD </td>
    <td align="center">https://github.com/Ljinyh</td>

  </tr>
    <tr>
    <td align="center"><b>김상선</b></a></td>
    <td align="center">Member</td>
    <td align="left">
    - 맛방 CRUD<br> 
    - 맛집 CRUD<br> 
    - 좋아요 기능<br> 
    - 맛집 태그 검색 필터링 기능 구현 <br> 
    - ERD 설계 (MongoDB) <br> 
    - 위치기반 서비스 GeoJson DB 쿼리<br> 
    - AWS S3 이미지 업로드 기능 구현 <br>
    - AWS Lambda를 이용한 리사이징<br>
    - Google Analytics 사용자 유입 분석</td>
   <td align="center">https://github.com/xoxokss</td>
  </tr>
</table>
<br/>

## 🍕 More Info 
[🌿 프로젝트 소개 문서](https://www.notion.so/WEat-617066c95d3f422fb10dda696d8f1b43)  
[💾 와이어프레임 Figma](https://www.figma.com/file/W4Yr7Umu4AvKSsI19LVouG/WEat?node-id=187%3A1238)  
[🔐 Front-End Github Repo](https://github.com/jeelly/weat/) 
