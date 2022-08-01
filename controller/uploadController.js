// upload controller

module.exports = {
    Get: async (req, res) => {
        res.send('연결 확인용 Get 요청');
    },

    // 이미지 업로더
    imageUploader: async (req, res) => {
        try {
            const image = req.files;
            const path = image.map((img) => img.location); // map 함수 사용. 여러개의 업로드 파일 URL을 배열로 출력.
            if (image === undefined) {
                return res
                    .status(400)
                    .send({ message: '이미지가 존재하지 않습니다.' });
            }
            res.status(200).send({
                message: '업로드 요청 완료',
                imageCount: image.length + '개',
                imgUrl: path,
            });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                message: '업로드 요청 실패',
            });
        }
    },


    // 단일 이미지 /image/single
    singleImage: async (req, res) => {
        const image = req.file;
        if (image === undefined) {
            return res
                .status(400)
                .json({ message: '이미지가 존재하지 않습니다.' });
        }
        const path = image.location;
        res.status(200).json({ imgUrl: path });
    },

    // multipart-form data /image/multi
    multiImages: async (req, res) => {
        const image = req.files;
        const imgArray = []
        if(image.img1){imgArray.push(image.img1[0].location)}
        if(image.img2){imgArray.push(image.img2[0].location)}
        if(image.img3){imgArray.push(image.img3[0].location)}
        if(image.img4){imgArray.push(image.img4[0].location)}
        if(image.img5){imgArray.push(image.img5[0].location)}

        if (image === undefined) {
            return res
                .status(400)
                .send({ message: '이미지가 존재하지 않습니다.' });
        }
        // const path = {
        //     img1,img2,img3,img4,img5
        // };
        res.status(200).send({ message: '업로드 성공', imgUrl: imgArray });
    },
};

//이미지 불러오기
// GetImages: async (req, res) => {
//     const { key } = req.params;
//     const fileStream = upload.getObject(key).createReadStream();
//     fileStream.pipe(res);
// },

/* 
//multer 공식 예제
app.post('/profile', upload.single('avatar'), function (req, res, next) {
    // req.file 은 `avatar` 라는 필드의 파일 정보입니다.
    // 텍스트 필드가 있는 경우, req.body가 이를 포함할 것입니다.
  })
  
  app.post('/photos/upload', upload.imgArray('photos', 12), function (req, res, next) {
    // req.files 는 `photos` 라는 파일정보를 배열로 가지고 있습니다.
    // 텍스트 필드가 있는 경우, req.body가 이를 포함할 것입니다.
  })
  
  const cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])
  app.post('/cool-profile', cpUpload, function (req, res, next) {
    // req.files는 (String -> imgArray) 형태의 객체 입니다.
    // 필드명은 객체의 key에, 파일 정보는 배열로 value에 저장됩니다.
    //
    // e.g.
    //  req.files['avatar'][0] -> File
    //  req.files['gallery'] -> imgArray
    //
    // 텍스트 필드가 있는 경우, req.body가 이를 포함할 것입니다.
  })
  */
