'use strict';

let videoHeight = 480
let videoWidth = 640
let outputCanvas_ori = document.getElementById("outputCanvas_ori");
let outputCanvas = document.getElementById("outputCanvas");
let p1 = document.getElementById("p1");
let p2 = document.getElementById("p2");
let video = document.getElementById("video");
var Height, Width, stream = null;
let cap = null
let src = null;
let gray = null;
let dst = null;
let templ = null;
const FPS = 30;
function run() {

    cap = new cv.VideoCapture(video)
    src = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4);
    gray = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC1);
    dst = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC1);
    startCamera();
    requestAnimationFrame(detect)
}

async function startCamera() {

    stream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: {
                videoWidth
            },
            height: {
                videoHeight
            },
            facingMode: "environment"
        },
        audio: false
    })
    video.srcObject = stream;
    video.play();
}

async function detect() {
    // Capture a frame
    try {
        cap.read(src)
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
        cv.adaptiveThreshold(gray, gray, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY_INV, 11, 4);
        let black = 0;
        let white = 0;
        let i = 0;
        for (let height = 0; height < videoHeight; height++) {
            let pixel_left = gray.ucharPtr(height, 24);
            let pix_right = gray.ucharPtr(height, 615);
            if (pixel_left[0] === 255 && pix_right[0] === 255) {
                black++;
            }
            if (pixel_left[0] === 0 && pix_right[0] === 0) {
                white--;
            }

        }
        templ = gray.clone();
        cv.line(src, new cv.Point(24, 0), new cv.Point(24, 480), [255, 0, 0, 255], 2);
        cv.line(src, new cv.Point(615, 0), new cv.Point(615, 480), [255, 0, 0, 255], 2);
        cv.imshow('outputCanvas_ori', src);
        let sym = black + white;
        if (-30 < sym && sym < 30) {

            cv.imshow('outputCanvas', templ);
            requestAnimationFrame(check)
        }
        else {
            requestAnimationFrame(detect);
        }
    } catch (e) {
        console.log(e);
        //var track = stream.getTracks(); 
       // track.stop();
    }


}
var start_right = [], end_right = [];
var start_left = [], end_left = [];
function check() {
    gray = templ.clone();
    let count_left = 0, count_right = 0;
    var conti = false;
    let i = 0, jump = 0;
    start_right = [], end_right = [];
    start_left = [], end_left = [];
    for (let height = videoHeight - 1; 0 <= height; height--) {
        let pix = gray.ucharPtr(height, 24);
        if (pix[0] === 255) {
            i++;
            if (i > 2 && !conti) {
                conti = true;
                start_left[count_left] = height + 3;
                jump = 0;

            }
        }
        else if (pix[0] === 0 && conti) {
            i = 0;
            end_left[count_left] = height;
            count_left++;
            conti = false;
        } else {
            jump++;
            i = 0;
            if (jump > 20 && count_left > 0) {
                count_left--;
            }
        }
    }

    conti = false;
    for (let height = videoHeight - 1; 0 <= height; height--) {
        let pix = gray.ucharPtr(height, 615);
        if (pix[0] === 255) {
            i++;
            if (i > 2 && !conti) {
                conti = true;
                jump = 0;
                start_right[count_right] = height + 3;

            }
        }
        else if (pix[0] === 0 && conti) {
            i = 0;
            end_right[count_right] = height;
            count_right++;
            conti = false;
        } else {
            jump++;
            i = 0;
            if (jump > 20 && count_right > 0) {
                count_right--;
            }
        }
    }


    if (count_right < 60 || count_left < 60) {
        requestAnimationFrame(detect);
    }
    else {
        let x1 = 24, x2 = 615, x3 = 24, x4 = 615, y1, y2, y3, y4, pos;
        //x1
        y1 = parseInt(start_left[0]) + parseInt(end_left[0]);
        y1 = parseInt(y1) / 2;

        for (i = 24; 0 <= i; i--) {
            let y = y1;
            let pix1 = gray.ucharPtr(y - 1, i - 1);
            let pix2 = gray.ucharPtr(y, i - 1);
            let pix3 = gray.ucharPtr(y + 1, i - 1);
            let pix4 = gray.ucharPtr(y + 1, i);
            let pix5 = gray.ucharPtr(y - 1, i);
            if (pix1[0] === 0 && pix2[0] === 0 && pix3[0] === 0 && pix4[0] === 0 && pix5[0] === 0) {
                x1 = i;
                break;
            }
        }
        //x2
        var pp = 0;
        y2 = parseInt(start_right[0]) + parseInt(end_right[0]);
        y2 = parseInt(y2) / 2;
        for (i = 615; i <= videoWidth; i++) {
            let y = y2;
            let pix1 = gray.ucharPtr(y - 1, i + 1);
            let pix2 = gray.ucharPtr(y, i + 1);
            let pix3 = gray.ucharPtr(y + 1, i + 1);
            let pix4 = gray.ucharPtr(y - 1, i);
            let pix5 = gray.ucharPtr(y + 1, i);
            if (pix1[0] === 0 && pix2[0] === 0 && pix3[0] === 0 && pix4[0] === 0 && pix5[0] === 0) {
                x2 = i;
                break;
            }
        }

        //x3
        y3 = parseInt(start_left[59]) + parseInt(end_left[59]);
        y3 = parseInt(y3) / 2;

        for (i = 24; 0 <= i; i--) {
            let y = y3;
            let pix1 = gray.ucharPtr(y - 1, i - 1);
            let pix2 = gray.ucharPtr(y, i - 1);
            let pix3 = gray.ucharPtr(y + 1, i - 1);
            let pix4 = gray.ucharPtr(y + 1, i);
            let pix5 = gray.ucharPtr(y - 1, i);
            if (pix1[0] === 0 && pix2[0] === 0 && pix3[0] === 0 && pix4[0] === 0 && pix5[0] === 0) {
                x3 = i;
                break;
            }
        }

        //x4
        y4 = parseInt(start_right[59]) + parseInt(end_right[59]);
        y4 = parseInt(y4) / 2;

        for (i = 615; i <= videoWidth; i++) {
            let y = y4;
            let pix1 = gray.ucharPtr(y - 1, i + 1);
            let pix2 = gray.ucharPtr(y, i + 1);
            let pix3 = gray.ucharPtr(y + 1, i + 1);
            let pix4 = gray.ucharPtr(y - 1, i);
            let pix5 = gray.ucharPtr(y + 1, i);
            if (pix1[0] === 0 && pix2[0] === 0 && pix3[0] === 0 && pix4[0] === 0 && pix5[0] === 0) {
                x4 = i;
                break;
            }
        }


        let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [x1, y1 + 8, x2, y2 + 8, x3, y3 - 4, x4, y4 - 4]);
        let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, videoHeight, videoWidth, videoHeight, 0, 0, videoWidth, 0]);
        let dsize = new cv.Size(videoWidth, videoHeight);
        let M = cv.getPerspectiveTransform(srcTri, dstTri);
        cv.warpPerspective(gray, gray, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
        cv.imshow('outputCanvas', gray);
        requestAnimationFrame(answer);
    }


}
let vel = [], verl = 0;

let count_left = 0, count_right = 0, count = 0;
function answer() {
    try {
        var i = 0, pixel = 0;
        start_right = [], end_right = [];
        start_left = [], end_left = [];
        var conti = false;
        for (let height = videoHeight; 0 <= height; height--) {
            let pix = gray.ucharPtr(height, 8);
            if (pix[0] === 255) {
                i++;
                if (i > 1 && !conti) {
                    conti = true;
                    start_left[count_left] = height + 2;


                }
            }
            else if (pix[0] === 0 && conti) {
                i = 0;
                end_left[count_left] = height + 1;
                conti = false;
                count_left++;

            } else {
                i = 0;
            }
        }
        if (conti) {
            conti = false;
            count_left++;
            end_left[count_left] = 0;
        }
        for (let height = videoHeight; 0 <= height; height--) {
            let pix = gray.ucharPtr(height, 631);
            if (pix[0] === 255) {
                i++;
                if (i > 1 && !conti) {
                    conti = true;
                    start_right[count_right] = height + 2;

                }
            }
            else if (pix[0] === 0 && conti) {
                i = 0;
                end_right[count_right] = height + 1;
                conti = false;
                count_right++;
            } else {
                i = 0;
            }
        }
        if (conti) {
            conti = false;
            count_right++;
            end_right[count_right] = 0;
        }
        //p1.innerHTML =  count_left + "***" + count_right;
        let page1 = 0, page2 = 0;
        for (i = 16; i <= 36; i++) {
            for (let j = start_left[59]; end_left[59] <= j; j--) {
                let pix = gray.ucharPtr(j, i);
                if (pix[0] === 255) {
                    page1++;
                }
            }

        }

        for (i = 16; i <= 36; i++) {
            for (let j = start_left[58]; end_left[58] <= j; j--) {
                let pix = gray.ucharPtr(j, i);
                if (pix[0] === 255) {
                    page2++;
                }
            }

        }
        conti = false;
        count = 0;
        //Page 1
        if (page1 > page2) {
            let times = 34;
            var posi = 0;
            posi = start_left[times];
            do {
                count = 0;
                vel = [];
                for (i = 20; i <= 620; i++) {
                    let pix1 = gray.ucharPtr(posi, i);
                    if (pix1[0] > 170 && !conti) {
                        vel[count] = i;
                        count++;
                        conti = true;
                    } else if (pix1[0] === 0) {
                        conti = false;
                    }
                }
                console.log(count);
                console.log("times:" + times);
                posi--;
                times--;
                if (times === 24) {
                    break;
                }

            } while (count !== 25)
            p1.innerHTML = count;
            if (times === 24) {
                requestAnimationFrame(detect);
                p1.innerHTML = "888";
            }
            else {
                requestAnimationFrame(Page1);
            }
        }
        //Page 2 
        else {
            let times = 11;
            var posi = 0;
            posi = start_left[times];
            do {
                count = 0;
                vel = [];
                for (i = 20; i <= 620; i++) {
                    let pix1 = gray.ucharPtr(posi, i);
                    if (pix1[0] > 170 && !conti) {
                        vel[count] = i;
                        count++;
                        conti = true;
                    } else if (pix1[0] === 0) {
                        conti = false;
                    }
                }
                console.log(count);
                console.log("times:" + times);
                posi--;
                times--;
                if (times === 0) {
                    break;
                }

            } while (count !== 20)
            p1.innerHTML = count;
            if (times === 0) {
                requestAnimationFrame(detect);
                p1.innerHTML = "999";
            }
            else {
                requestAnimationFrame(Page2);
            }
        }
    }
    catch{
        requestAnimationFrame(detect);
    }




}
let ans = "", ans1 = [], ans2 = [], ans3 = [], ans4 = [], strans = "";
//p2.innerHTML = count_left+"***"+count_right;
let section4B = 37, section1 = 47, section2 = 31, section3 = 17, section3B = 11;
let section4 = 47, A = 0, B = 0, C = 0, D = 0;
let CA = 0, CB = 0, CC = 0, CD = 0;
let pre = 0.44, preblack = 0.64;
function Page1() {

    let i;
    let M1 = cv.Mat.ones(3, 3, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);
    let pos;
    cv.morphologyEx(gray, gray, cv.MORPH_OPEN, M1, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    cv.morphologyEx(gray, gray, cv.MORPH_CLOSE, M1, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    i = 0;
    //SECTION 1
    //Answer 1~52
    templ = gray.clone();
    for (i = 0; i < 52; i++) {
        CA = 0, CB = 0, CC = 0, CD = 0;
        A = 0, B = 0, C = 0, D = 0, strans = "";
        if (i < 13) {
            pos = section1;
            verl = parseInt(i / 13) * 5 + 1;
            //answer A
            for (let n = vel[verl] + 1; n <= vel[verl] + 8; n++) {
                for (let j = start_left[pos - i % 13]; end_left[pos - i % 13] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CA++;
                    if (pix[0] > 170) {
                        A++;

                    }
                }
            }
            if (i % 13 % 3 === 2) {
                if ((A / CA) > preblack) {
                    strans = strans.concat("A");
                }
            } else {
                if ((A / CA) > pre) {
                    strans = strans.concat("A");
                }
            }
            //answer B
            for (let n = vel[verl + 1] + 3; n <= vel[verl + 1] + 10; n++) {
                for (let j = start_left[pos - i % 13]; end_left[pos - i % 13] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CB++;
                    if (pix[0] > 170) {
                        B++;
                    }
                }
            }
            if (i % 13 % 3 === 2) {
                if ((B / CB) > preblack) {
                    strans = strans.concat("B");
                }
            } else {
                if ((B / CB) > pre) {
                    strans = strans.concat("B");
                }
            }
            //answer C
            for (let n = vel[verl + 2] + 1; n <= vel[verl + 2] + 8; n++) {
                for (let j = start_left[pos - i % 13]; end_left[pos - i % 13] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CC++;
                    if (pix[0] > 170) {
                        C++;
                    }
                }
            }
            if (i % 13 % 3 === 2) {
                if ((C / CC) > preblack) {
                    strans = strans.concat("C");
                }
            } else {
                if ((C / CC) > pre) {
                    strans = strans.concat("C");
                }
            }
            //answer D
            for (let n = vel[verl + 3] + 1; n <= vel[verl + 3] + 8; n++) {
                for (let j = start_left[pos - i % 13]; end_left[pos - i % 13] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CD++;
                    if (pix[0] > 170) {
                        D++;
                    }
                }
            }
            if (i % 13 % 3 === 2) {
                if ((D / CD) > preblack) {
                    strans = strans.concat("D");
                }
            } else {
                if ((D / CD) > pre) {
                    strans = strans.concat("D");
                }
            }
            if (strans === "") {
                ans1[i] = "X";
            } else {
                if (strans.length > 1) {
                    strans = "O";
                }
                ans1[i] = strans;
            }
        } else if (i < 26) {
            pos = section1;
            verl = parseInt(i / 13) * 5 + 2;
            console.log(verl);
            //answer A
            for (let n = vel[verl] + 1; n <= vel[verl] + 8; n++) {
                for (let j = start_left[pos - i % 13]; end_left[pos - i % 13] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CA++;
                    if (pix[0] > 170) {
                        A++;

                    }
                }
            }
            if (i % 13 % 3 === 2) {
                if ((A / CA) > preblack) {
                    strans = strans.concat("A");
                }
            } else {
                if ((A / CA) > pre) {
                    strans = strans.concat("A");
                }
            }
            //answer B
            for (let n = vel[verl + 1] + 5; n <= vel[verl + 1] + 12; n++) {
                for (let j = start_left[pos - i % 13]; end_left[pos - i % 13] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CB++;
                    if (pix[0] > 170) {
                        B++;
                    }
                }
            }
            if (i % 13 % 3 === 2) {
                if ((B / CB) > preblack) {
                    strans = strans.concat("B");
                }
            } else {
                if ((B / CB) > pre) {
                    strans = strans.concat("B");
                }
            }
            //answer C
            for (let n = vel[verl + 2] + 2; n <= vel[verl + 2] + 9; n++) {
                for (let j = start_left[pos - i % 13]; end_left[pos - i % 13] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CC++;
                    if (pix[0] > 170) {
                        C++;
                    }
                }
            }
            if (i % 13 % 3 === 2) {
                if ((C / CC) > preblack) {
                    strans = strans.concat("C");
                }
            } else {
                if ((C / CC) > pre) {
                    strans = strans.concat("C");
                }
            }
            //answer D
            for (let n = vel[verl + 3] + 7; n <= vel[verl + 3] + 14; n++) {
                for (let j = start_left[pos - i % 13]; end_left[pos - i % 13] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CD++;
                    if (pix[0] > 170) {
                        D++;
                    }
                }
            }
            if (i % 13 % 3 === 2) {
                if ((D / CD) > preblack) {
                    strans = strans.concat("D");
                }
            } else {
                if ((D / CD) > pre) {
                    strans = strans.concat("D");
                }
            }
            if (strans === "") {
                ans1[i] = "X";
            } else {
                if (strans.length > 1) {
                    strans = "O";
                }
                ans1[i] = strans;
            }
        } else if (i < 39) {
            pos = section1;
            verl = parseInt(i / 13) * 5 + 3;
            //answer A
            for (let n = vel[verl] + 1; n <= vel[verl] + 8; n++) {
                for (let j = start_left[pos - i % 13]; end_left[pos - i % 13] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CA++;
                    if (pix[0] > 170) {
                        A++;

                    }
                }
            }
            if (i % 13 % 3 === 2) {
                if ((A / CA) > preblack) {
                    strans = strans.concat("A");
                }
            } else {
                if ((A / CA) > pre) {
                    strans = strans.concat("A");
                }
            }
            //answer B
            for (let n = vel[verl + 1] + 3; n <= vel[verl + 1] + 10; n++) {
                for (let j = start_left[pos - i % 13]; end_left[pos - i % 13] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CB++;
                    if (pix[0] > 170) {
                        B++;
                    }
                }
            }
            if (i % 13 % 3 === 2) {
                if ((B / CB) > preblack) {
                    strans = strans.concat("B");
                }
            } else {
                if ((B / CB) > pre) {
                    strans = strans.concat("B");
                }
            }
            //answer C
            for (let n = vel[verl + 2] + 14; n <= vel[verl + 2] + 21; n++) {
                for (let j = start_left[pos - i % 13]; end_left[pos - i % 13] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CC++;
                    if (pix[0] > 170) {
                        C++;
                    }
                }
            }
            if (i % 13 % 3 === 2) {
                if ((C / CC) > preblack) {
                    strans = strans.concat("C");
                }
            } else {
                if ((C / CC) > pre) {
                    strans = strans.concat("C");
                }
            }
            //answer D
            for (let n = vel[verl + 3] + 17; n <= vel[verl + 3] + 24; n++) {
                for (let j = start_left[pos - i % 13]; end_left[pos - i % 13] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CD++;
                    if (pix[0] > 170) {
                        D++;
                    }
                }
            }
            if (i % 13 % 3 === 2) {
                if ((D / CD) > preblack) {
                    strans = strans.concat("D");
                }
            } else {
                if ((D / CD) > pre) {
                    strans = strans.concat("D");
                }
            }
            if (strans === "") {
                ans1[i] = "X";
            } else {
                if (strans.length > 1) {
                    strans = "O";
                }
                ans1[i] = strans;
            }
        } else if (i < 52) {
            pos = section1;
            verl = parseInt(i / 13) * 5 + 4;
            //answer A
            for (let n = vel[verl] + 6; n <= vel[verl] + 13; n++) {
                for (let j = start_left[pos - i % 13]; end_left[pos - i % 13] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CA++;
                    if (pix[0] > 170) {
                        A++;

                    }
                }
            }
            if (i % 13 % 3 === 2) {
                if ((A / CA) > preblack) {
                    strans = strans.concat("A");
                }
            } else {
                if ((A / CA) > pre) {
                    strans = strans.concat("A");
                }
            }
            //answer B
            for (let n = vel[verl + 2] - 11; n <= vel[verl + 2] - 3; n++) {
                for (let j = start_left[pos - i % 13]; end_left[pos - i % 13] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CB++;
                    if (pix[0] > 170) {
                        B++;
                    }
                }
            }
            if (i % 13 % 3 === 2) {
                if ((B / CB) > preblack) {
                    strans = strans.concat("B");
                }
            } else {
                if ((B / CB) > pre) {
                    strans = strans.concat("B");
                }
            }
            //answer C
            for (let n = vel[verl + 3] - 9; n <= vel[verl + 3] - 2; n++) {
                for (let j = start_left[pos - i % 13]; end_left[pos - i % 13] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CC++;
                    if (pix[0] > 170) {
                        C++;
                    }
                }
            }
            if (i % 13 % 3 === 2) {
                if ((C / CC) > preblack) {
                    strans = strans.concat("C");
                }
            } else {
                if ((C / CC) > pre) {
                    strans = strans.concat("C");
                }
            }
            //answer D
            for (let n = vel[verl + 4] - 10; n <= vel[verl + 4] - 3; n++) {
                for (let j = start_left[pos - i % 13]; end_left[pos - i % 13] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CD++;
                    if (pix[0] > 170) {
                        D++;
                    }
                }
            }
            if (i % 13 % 3 === 2) {
                if ((D / CD) > preblack) {
                    strans = strans.concat("D");
                }
            } else {
                if ((D / CD) > pre) {
                    strans = strans.concat("D");
                }
            }
            if (strans === "") {
                ans1[i] = "X";
            } else {
                if (strans.length > 1) {
                    strans = "O";
                }
                ans1[i] = strans;
            }
        }
    }
    //SECTION 2
    //Answer 1~44
    for (i = 0; i < 44; i++) {
        CA = 0, CB = 0, CC = 0, CD = 0;
        A = 0, B = 0, C = 0, D = 0, strans = "";
        if (i < 11) {
            pos = section2;
            verl = parseInt(i / 11) * 5 + 1;
            //cv.line(templ, new cv.Point(vel[verl] + 1, 0), new cv.Point(vel[verl] + 1, 480), [255, 255, 255, 0], 1);
            // cv.line(templ, new cv.Point(vel[verl] + 8, 0), new cv.Point(vel[verl] + 8, 480), [255, 255, 255, 0], 1);
            //answer A
            for (let n = vel[verl] + 1; n <= vel[verl] + 8; n++) {
                for (let j = start_left[pos - i % 11]; end_left[pos - i % 11] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CA++;
                    if (pix[0] > 170) {
                        A++;

                    }
                }
            }
            if (i % 11 % 3 === 2) {
                if ((A / CA) > preblack) {
                    strans = strans.concat("A");
                }
            } else {
                if ((A / CA) > pre) {
                    strans = strans.concat("A");
                }
            }
            //cv.line(templ, new cv.Point(vel[verl + 1] + 3, 0), new cv.Point(vel[verl + 1] + 3, 480), [255, 255, 255, 0], 1);
            //cv.line(templ, new cv.Point(vel[verl + 1] + 10, 0), new cv.Point(vel[verl + 1] + 10, 480), [255, 255, 255, 0], 1);
            //answer B
            for (let n = vel[verl + 1] + 3; n <= vel[verl + 1] + 10; n++) {
                for (let j = start_left[pos - i % 11]; end_left[pos - i % 1] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CB++;
                    if (pix[0] > 170) {
                        B++;
                    }
                }
            }
            if (i % 11 % 3 === 2) {
                if ((B / CB) > preblack) {
                    strans = strans.concat("B");
                }
            } else {
                if ((B / CB) > pre) {
                    strans = strans.concat("B");
                }
            }
            //cv.line(templ, new cv.Point(vel[verl + 2] + 1, 0), new cv.Point(vel[verl + 2] + 1, 480), [255, 255, 255, 0], 1);
            //cv.line(templ, new cv.Point(vel[verl + 2] + 8, 0), new cv.Point(vel[verl + 2] + 8, 480), [255, 255, 255, 0], 1);
            //answer C
            for (let n = vel[verl + 2] + 1; n <= vel[verl + 2] + 8; n++) {
                for (let j = start_left[pos - i % 11]; end_left[pos - i % 11] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CC++;
                    if (pix[0] > 170) {
                        C++;
                    }
                }
            }
            if (i % 11 % 3 === 2) {
                if ((C / CC) > preblack) {
                    strans = strans.concat("C");
                }
            } else {
                if ((C / CC) > pre) {
                    strans = strans.concat("C");
                }
            }
            //cv.line(templ, new cv.Point(vel[verl + 3] + 1, 0), new cv.Point(vel[verl + 3] + 1, 480), [255, 255, 255, 0], 1);
            //cv.line(templ, new cv.Point(vel[verl + 3] + 8, 0), new cv.Point(vel[verl + 3] + 8, 480), [255, 255, 255, 0], 1);
            //answer D
            for (let n = vel[verl + 3] + 1; n <= vel[verl + 3] + 8; n++) {
                for (let j = start_left[pos - i % 11]; end_left[pos - i % 11] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CD++;
                    if (pix[0] > 170) {
                        D++;
                    }
                }
            }
            if (i % 11 % 3 === 2) {
                if ((D / CD) > preblack) {
                    strans = strans.concat("D");
                }
            } else {
                if ((D / CD) > pre) {
                    strans = strans.concat("D");
                }
            }
            if (strans === "") {
                ans2[i] = "X";
            } else {
                if (strans.length > 1) {
                    strans = "O";
                }
                ans2[i] = strans;
            }
        } else if (i < 22) {
            pos = section2;
            verl = parseInt(i / 11) * 5 + 2;
            console.log(verl);
            //cv.line(templ, new cv.Point(vel[verl] + 1, 0), new cv.Point(vel[verl] + 1, 480), [255, 255, 255, 0], 1);
            //cv.line(templ, new cv.Point(vel[verl] + 8, 0), new cv.Point(vel[verl] + 8, 480), [255, 255, 255, 0], 1);
            //answer A
            for (let n = vel[verl] + 1; n <= vel[verl] + 8; n++) {
                for (let j = start_left[pos - i % 11]; end_left[pos - i % 11] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CA++;
                    if (pix[0] > 170) {
                        A++;

                    }
                }
            }
            if (i % 11 % 3 === 2) {
                if ((A / CA) > preblack) {
                    strans = strans.concat("A");
                }
            } else {
                if ((A / CA) > pre) {
                    strans = strans.concat("A");
                }
            }
            //cv.line(templ, new cv.Point(vel[verl + 1] + 5, 0), new cv.Point(vel[verl + 1] + 5, 480), [255, 255, 255, 0], 1);
            //cv.line(templ, new cv.Point(vel[verl + 1] + 12, 0), new cv.Point(vel[verl + 1] + 12, 480), [255, 255, 255, 0], 1);
            //answer B
            for (let n = vel[verl + 1] + 5; n <= vel[verl + 1] + 12; n++) {
                for (let j = start_left[pos - i % 11]; end_left[pos - i % 11] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CB++;
                    if (pix[0] > 170) {
                        B++;
                    }
                }
            }
            if (i % 11 % 3 === 2) {
                if ((B / CB) > preblack) {
                    strans = strans.concat("B");
                }
            } else {
                if ((B / CB) > pre) {
                    strans = strans.concat("B");
                }
            }
            //cv.line(templ, new cv.Point(vel[verl + 2] + 2, 0), new cv.Point(vel[verl + 2] + 2, 480), [255, 255, 255, 0], 1);
            //cv.line(templ, new cv.Point(vel[verl + 2] + 9, 0), new cv.Point(vel[verl + 2] + 9, 480), [255, 255, 255, 0], 1);
            //answer C
            for (let n = vel[verl + 2] + 2; n <= vel[verl + 2] + 9; n++) {
                for (let j = start_left[pos - i % 11]; end_left[pos - i % 11] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CC++;
                    if (pix[0] > 170) {
                        C++;
                    }
                }
            }
            if (i % 11 % 3 === 2) {
                if ((C / CC) > preblack) {
                    strans = strans.concat("C");
                }
            } else {
                if ((C / CC) > pre) {
                    strans = strans.concat("C");
                }
            }
            // cv.line(templ, new cv.Point(vel[verl + 3] + 7, 0), new cv.Point(vel[verl + 3] + 7, 480), [255, 255, 255, 0], 1);
            // cv.line(templ, new cv.Point(vel[verl + 3] + 14, 0), new cv.Point(vel[verl + 3] + 14, 480), [255, 255, 255, 0], 1);
            //answer D
            for (let n = vel[verl + 3] + 7; n <= vel[verl + 3] + 14; n++) {
                for (let j = start_left[pos - i % 11]; end_left[pos - i % 11] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CD++;
                    if (pix[0] > 170) {
                        D++;
                    }
                }
            }
            if (i % 11 % 3 === 2) {
                if ((D / CD) > preblack) {
                    strans = strans.concat("D");
                }
            } else {
                if ((D / CD) > pre) {
                    strans = strans.concat("D");
                }
            }
            if (strans === "") {
                ans2[i] = "X";
            } else {
                if (strans.length > 1) {
                    strans = "O";
                }
                ans2[i] = strans;
            }
        } else if (i < 33) {
            pos = section2;
            verl = parseInt(i / 11) * 5 + 3;
            //cv.line(templ, new cv.Point(vel[verl] + 1, 0), new cv.Point(vel[verl] + 1, 480), [255, 255, 255, 0], 1);
            // cv.line(templ, new cv.Point(vel[verl] + 8, 0), new cv.Point(vel[verl] + 8, 480), [255, 255, 255, 0], 1);
            //answer A
            for (let n = vel[verl] + 1; n <= vel[verl] + 8; n++) {
                for (let j = start_left[pos - i % 11]; end_left[pos - i % 11] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CA++;
                    if (pix[0] > 170) {
                        A++;

                    }
                }
            }
            if (i % 11 % 3 === 2) {
                if ((A / CA) > preblack) {
                    strans = strans.concat("A");
                }
            } else {
                if ((A / CA) > pre) {
                    strans = strans.concat("A");
                }
            }
            // cv.line(templ, new cv.Point(vel[verl + 1] + 3, 0), new cv.Point(vel[verl + 1] + 3, 480), [255, 255, 255, 0], 1);
            //cv.line(templ, new cv.Point(vel[verl + 1] + 10, 0), new cv.Point(vel[verl + 1] + 10, 480), [255, 255, 255, 0], 1);
            //answer B
            for (let n = vel[verl + 1] + 3; n <= vel[verl + 1] + 10; n++) {
                for (let j = start_left[pos - i % 11]; end_left[pos - i % 11] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CB++;
                    if (pix[0] > 170) {
                        B++;
                    }
                }
            }
            if (i % 11 % 3 === 2) {
                if ((B / CB) > preblack) {
                    strans = strans.concat("B");
                }
            } else {
                if ((B / CB) > pre) {
                    strans = strans.concat("B");
                }
            }
            // cv.line(templ, new cv.Point(vel[verl + 2] + 14, 0), new cv.Point(vel[verl + 2] + 14, 480), [255, 255, 255, 0], 1);
            // cv.line(templ, new cv.Point(vel[verl + 2] + 21, 0), new cv.Point(vel[verl + 2] + 21, 480), [255, 255, 255, 0], 1);
            //answer C
            for (let n = vel[verl + 2] + 14; n <= vel[verl + 2] + 21; n++) {
                for (let j = start_left[pos - i % 11]; end_left[pos - i % 11] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CC++;
                    if (pix[0] > 170) {
                        C++;
                    }
                }
            }
            if (i % 11 % 3 === 2) {
                if ((C / CC) > preblack) {
                    strans = strans.concat("C");
                }
            } else {
                if ((C / CC) > pre) {
                    strans = strans.concat("C");
                }
            }
            // cv.line(templ, new cv.Point(vel[verl + 3] + 17, 0), new cv.Point(vel[verl + 3] + 17, 480), [255, 255, 255, 0], 1);
            // cv.line(templ, new cv.Point(vel[verl + 3] + 24, 0), new cv.Point(vel[verl + 3] + 24, 480), [255, 255, 255, 0], 1);
            //answer D
            for (let n = vel[verl + 3] + 17; n <= vel[verl + 3] + 24; n++) {
                for (let j = start_left[pos - i % 11]; end_left[pos - i % 11] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CD++;
                    if (pix[0] > 170) {
                        D++;
                    }
                }
            }
            if (i % 11 % 3 === 2) {
                if ((D / CD) > preblack) {
                    strans = strans.concat("D");
                }
            } else {
                if ((D / CD) > pre) {
                    strans = strans.concat("D");
                }
            }
            if (strans === "") {
                ans2[i] = "X";
            } else {
                if (strans.length > 1) {
                    strans = "O";
                }
                ans2[i] = strans;
            }
        } else if (i < 44) {
            pos = section2;
            verl = parseInt(i / 11) * 5 + 4;
            // cv.line(templ, new cv.Point(vel[verl] + 6, 0), new cv.Point(vel[verl] + 6, 480), [255, 255, 255, 0], 1);
            // cv.line(templ, new cv.Point(vel[verl] + 13, 0), new cv.Point(vel[verl] + 13, 480), [255, 255, 255, 0], 1);
            //answer A
            for (let n = vel[verl] + 6; n <= vel[verl] + 13; n++) {
                for (let j = start_left[pos - i % 11]; end_left[pos - i % 11] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CA++;
                    if (pix[0] > 170) {
                        A++;

                    }
                }
            }
            if (i % 11 % 3 === 2) {
                if ((A / CA) > preblack) {
                    strans = strans.concat("A");
                }
            } else {
                if ((A / CA) > pre) {
                    strans = strans.concat("A");
                }
            }
            //cv.line(templ, new cv.Point(vel[verl + 2] - 3, 0), new cv.Point(vel[verl + 2] - 3, 480), [255, 255, 255, 0], 1);
            // cv.line(templ, new cv.Point(vel[verl + 2] - 11, 0), new cv.Point(vel[verl + 2] - 11, 480), [255, 255, 255, 0], 1);
            //answer B
            for (let n = vel[verl + 2] - 11; n <= vel[verl + 2] - 3; n++) {
                for (let j = start_left[pos - i % 11]; end_left[pos - i % 11] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CB++;
                    if (pix[0] > 170) {
                        B++;
                    }
                }
            }
            if (i % 11 % 3 === 2) {
                if ((B / CB) > preblack) {
                    strans = strans.concat("B");
                }
            } else {
                if ((B / CB) > pre) {
                    strans = strans.concat("B");
                }
            }
            // cv.line(templ, new cv.Point(vel[verl + 3] - 2, 0), new cv.Point(vel[verl + 3] - 2, 480), [255, 255, 255, 0], 1);
            //cv.line(templ, new cv.Point(vel[verl + 3] - 9, 0), new cv.Point(vel[verl + 3] - 9, 480), [255, 255, 255, 0], 1);
            //answer C
            for (let n = vel[verl + 3] - 9; n <= vel[verl + 3] - 2; n++) {
                for (let j = start_left[pos - i % 11]; end_left[pos - i % 11] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CC++;
                    if (pix[0] > 170) {
                        C++;
                    }
                }
            }
            if (i % 11 % 3 === 2) {
                if ((C / CC) > preblack) {
                    strans = strans.concat("C");
                }
            } else {
                if ((C / CC) > pre) {
                    strans = strans.concat("C");
                }
            }
            //cv.line(templ, new cv.Point(vel[verl + 4] - 5, 0), new cv.Point(vel[verl + 4] - 5, 480), [255, 255, 255, 0], 1);
            //cv.line(templ, new cv.Point(vel[verl + 4] - 12, 0), new cv.Point(vel[verl + 4] - 12, 480), [255, 255, 255, 0], 1);
            //answer D
            for (let n = vel[verl + 4] - 12; n <= vel[verl + 4] - 5; n++) {
                for (let j = start_left[pos - i % 11]; end_left[pos - i % 11] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CD++;
                    if (pix[0] > 170) {
                        D++;
                    }
                }
            }
            if (i % 11 % 3 === 2) {
                if ((D / CD) > preblack) {
                    strans = strans.concat("D");
                }
            } else {
                if ((D / CD) > pre) {
                    strans = strans.concat("D");
                }
            }
            if (strans === "") {
                ans2[i] = "X";
            } else {
                if (strans.length > 1) {
                    strans = "O";
                }
                ans2[i] = strans;
            }
        }
    }
    //SECTION 3
    //Answer 1~20
    for (i = 0; i < 20; i++) {
        CA = 0, CB = 0, CC = 0, CD = 0;
        A = 0, B = 0, C = 0, D = 0, strans = "";
        if (i < 4) {
            pos = section3;
            verl = parseInt(i / 4) * 5 + 1;
            //cv.line(templ, new cv.Point(vel[verl] - 1, 0), new cv.Point(vel[verl] - 1, 480), [255, 255, 255, 0], 1);
            //cv.line(templ, new cv.Point(vel[verl] + 6, 0), new cv.Point(vel[verl] + 6, 480), [255, 255, 255, 0], 1);
            //answer A
            for (let n = vel[verl] - 1; n <= vel[verl] + 6; n++) {
                for (let j = start_left[pos - i % 4]; end_left[pos - i % 4] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CA++;
                    if (pix[0] > 170) {
                        A++;

                    }
                }
            }
            if (i % 4 % 3 === 2) {
                if ((A / CA) > preblack) {
                    strans = strans.concat("A");
                }
            } else {
                if ((A / CA) > pre) {
                    strans = strans.concat("A");
                }
            }
            //cv.line(templ, new cv.Point(vel[verl + 1] + 3, 0), new cv.Point(vel[verl + 1] + 3, 480), [255, 255, 255, 0], 1);
            //cv.line(templ, new cv.Point(vel[verl + 1] + 10, 0), new cv.Point(vel[verl + 1] + 10, 480), [255, 255, 255, 0], 1);
            //answer B
            for (let n = vel[verl + 1] + 3; n <= vel[verl + 1] + 10; n++) {
                for (let j = start_left[pos - i % 4]; end_left[pos - i % 4] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CB++;
                    if (pix[0] > 170) {
                        B++;
                    }
                }
            }
            if (i % 4 % 3 === 2) {
                if ((B / CB) > preblack) {
                    strans = strans.concat("B");
                }
            } else {
                if ((B / CB) > pre) {
                    strans = strans.concat("B");
                }
            }
            //cv.line(templ, new cv.Point(vel[verl + 2] + 1, 0), new cv.Point(vel[verl + 2] + 1, 480), [255, 255, 255, 0], 1);
            // cv.line(templ, new cv.Point(vel[verl + 2] + 8, 0), new cv.Point(vel[verl + 2] + 8, 480), [255, 255, 255, 0], 1);
            //answer C
            for (let n = vel[verl + 2] + 1; n <= vel[verl + 2] + 8; n++) {
                for (let j = start_left[pos - i % 4]; end_left[pos - i % 4] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CC++;
                    if (pix[0] > 170) {
                        C++;
                    }
                }
            }
            if (i % 4 % 3 === 2) {
                if ((C / CC) > preblack) {
                    strans = strans.concat("C");
                }
            } else {
                if ((C / CC) > pre) {
                    strans = strans.concat("C");
                }
            }
            // cv.line(templ, new cv.Point(vel[verl + 3] + 1, 0), new cv.Point(vel[verl + 3] + 1, 480), [255, 255, 255, 0], 1);
            //cv.line(templ, new cv.Point(vel[verl + 3] + 8, 0), new cv.Point(vel[verl + 3] + 8, 480), [255, 255, 255, 0], 1);
            //answer D
            for (let n = vel[verl + 3] + 1; n <= vel[verl + 3] + 8; n++) {
                for (let j = start_left[pos - i % 4]; end_left[pos - i % 4] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CD++;
                    if (pix[0] > 170) {
                        D++;
                    }
                }
            }
            if (i % 4 % 3 === 2) {
                if ((D / CD) > preblack) {
                    strans = strans.concat("D");
                }
            } else {
                if ((D / CD) > pre) {
                    strans = strans.concat("D");
                }
            }
            if (strans === "") {
                ans3[i] = "X";
            } else {
                if (strans.length > 1) {
                    strans = "O";
                }
                ans3[i] = strans;
            }
        } else if (i < 8) {
            pos = section3;
            verl = parseInt(i / 4) * 5 + 2;
            console.log(verl);
            //cv.line(templ, new cv.Point(vel[verl] + 1, 0), new cv.Point(vel[verl] + 1, 480), [255, 255, 255, 0], 1);
            //cv.line(templ, new cv.Point(vel[verl] + 8, 0), new cv.Point(vel[verl] + 8, 480), [255, 255, 255, 0], 1);
            //answer A
            for (let n = vel[verl] + 1; n <= vel[verl] + 8; n++) {
                for (let j = start_left[pos - i % 4]; end_left[pos - i % 4] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CA++;
                    if (pix[0] > 170) {
                        A++;
                    }
                }
            }
            if (i % 4 % 3 === 2) {
                if ((A / CA) > preblack) {
                    strans = strans.concat("A");
                }
            } else {
                if ((A / CA) > pre) {
                    strans = strans.concat("A");
                }
            }
            //cv.line(templ, new cv.Point(vel[verl + 1] + 5, 0), new cv.Point(vel[verl + 1] + 5, 480), [255, 255, 255, 0], 1);
            //cv.line(templ, new cv.Point(vel[verl + 1] + 12, 0), new cv.Point(vel[verl + 1] + 12, 480), [255, 255, 255, 0], 1);
            //answer B
            for (let n = vel[verl + 1] + 5; n <= vel[verl + 1] + 12; n++) {
                for (let j = start_left[pos - i % 4]; end_left[pos - i % 4] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CB++;
                    if (pix[0] > 170) {
                        B++;
                    }
                }
            }
            if (i % 4 % 3 === 2) {
                if ((B / CB) > preblack) {
                    strans = strans.concat("B");
                }
            } else {
                if ((B / CB) > pre) {
                    strans = strans.concat("B");
                }
            }
            // cv.line(templ, new cv.Point(vel[verl + 2] + 2, 0), new cv.Point(vel[verl + 2] + 2, 480), [255, 255, 255, 0], 1);
            //cv.line(templ, new cv.Point(vel[verl + 2] + 9, 0), new cv.Point(vel[verl + 2] + 9, 480), [255, 255, 255, 0], 1);
            //answer C
            for (let n = vel[verl + 2] + 2; n <= vel[verl + 2] + 9; n++) {
                for (let j = start_left[pos - i % 4]; end_left[pos - i % 4] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CC++;
                    if (pix[0] > 170) {
                        C++;
                    }
                }
            }
            if (i % 4 % 3 === 2) {
                if ((C / CC) > preblack) {
                    strans = strans.concat("C");
                }
            } else {
                if ((C / CC) > pre) {
                    strans = strans.concat("C");
                }
            }
            //cv.line(templ, new cv.Point(vel[verl + 3] + 7, 0), new cv.Point(vel[verl + 3] + 7, 480), [255, 255, 255, 0], 1);
            // cv.line(templ, new cv.Point(vel[verl + 3] + 14, 0), new cv.Point(vel[verl + 3] + 14, 480), [255, 255, 255, 0], 1);
            //answer D
            for (let n = vel[verl + 3] + 7; n <= vel[verl + 3] + 14; n++) {
                for (let j = start_left[pos - i % 4]; end_left[pos - i % 4] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CD++;
                    if (pix[0] > 170) {
                        D++;
                    }
                }
            }
            if (i % 4 % 3 === 2) {
                if ((D / CD) > preblack) {
                    strans = strans.concat("D");
                }
            } else {
                if ((D / CD) > pre) {
                    strans = strans.concat("D");
                }
            }
            if (strans === "") {
                ans3[i] = "X";
            } else {
                if (strans.length > 1) {
                    strans = "O";
                }
                ans3[i] = strans;
            }
        } else if (i < 12) {
            pos = section3;
            verl = parseInt(i / 4) * 5 + 3;
            //cv.line(templ, new cv.Point(vel[verl] + 1, 0), new cv.Point(vel[verl] + 1, 480), [255, 255, 255, 0], 1);
            //cv.line(templ, new cv.Point(vel[verl] + 8, 0), new cv.Point(vel[verl] + 8, 480), [255, 255, 255, 0], 1);
            //answer A
            for (let n = vel[verl] + 1; n <= vel[verl] + 8; n++) {
                for (let j = start_left[pos - i % 4]; end_left[pos - i % 4] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CA++;
                    if (pix[0] > 170) {
                        A++;

                    }
                }
            }
            if (i % 4 % 3 === 2) {
                if ((A / CA) > preblack) {
                    strans = strans.concat("A");
                }
            } else {
                if ((A / CA) > pre) {
                    strans = strans.concat("A");
                }
            }
            // cv.line(templ, new cv.Point(vel[verl + 1] + 3, 0), new cv.Point(vel[verl + 1] + 3, 480), [255, 255, 255, 0], 1);
            // cv.line(templ, new cv.Point(vel[verl + 1] + 10, 0), new cv.Point(vel[verl + 1] + 10, 480), [255, 255, 255, 0], 1);
            //answer B
            for (let n = vel[verl + 1] + 3; n <= vel[verl + 1] + 10; n++) {
                for (let j = start_left[pos - i % 4]; end_left[pos - i % 4] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CB++;
                    if (pix[0] > 170) {
                        B++;
                    }
                }
            }
            if (i % 4 % 3 === 2) {
                if ((B / CB) > preblack) {
                    strans = strans.concat("B");
                }
            } else {
                if ((B / CB) > pre) {
                    strans = strans.concat("B");
                }
            }
            //cv.line(templ, new cv.Point(vel[verl + 2] + 14, 0), new cv.Point(vel[verl + 2] + 14, 480), [255, 255, 255, 0], 1);
            // cv.line(templ, new cv.Point(vel[verl + 2] + 21, 0), new cv.Point(vel[verl + 2] + 21, 480), [255, 255, 255, 0], 1);
            //answer C
            for (let n = vel[verl + 2] + 14; n <= vel[verl + 2] + 21; n++) {
                for (let j = start_left[pos - i % 4]; end_left[pos - i % 4] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CC++;
                    if (pix[0] > 170) {
                        C++;
                    }
                }
            }
            if (i % 4 % 3 === 2) {
                if ((C / CC) > preblack) {
                    strans = strans.concat("C");
                }
            } else {
                if ((C / CC) > pre) {
                    strans = strans.concat("C");
                }
            }
            //cv.line(templ, new cv.Point(vel[verl + 3] + 17, 0), new cv.Point(vel[verl + 3] + 17, 480), [255, 255, 255, 0], 1);
            //cv.line(templ, new cv.Point(vel[verl + 3] + 24, 0), new cv.Point(vel[verl + 3] + 24, 480), [255, 255, 255, 0], 1);
            //answer D
            for (let n = vel[verl + 3] + 17; n <= vel[verl + 3] + 24; n++) {
                for (let j = start_left[pos - i % 4]; end_left[pos - i % 4] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CD++;
                    if (pix[0] > 170) {
                        D++;
                    }
                }
            }
            if (i % 4 % 3 === 2) {
                if ((D / CD) > preblack) {
                    strans = strans.concat("D");
                }
            } else {
                if ((D / CD) > pre) {
                    strans = strans.concat("D");
                }
            }
            if (strans === "") {
                ans3[i] = "X";
            } else {
                if (strans.length > 1) {
                    strans = "O";
                }
                ans3[i] = strans;
            }
        } else if (i < 15) {
            pos = section3;
            verl = parseInt(i / 4) * 5 + 4;
            //cv.line(templ, new cv.Point(vel[verl] + 6, 0), new cv.Point(vel[verl] + 6, 480), [255, 255, 255, 0], 1);
            // cv.line(templ, new cv.Point(vel[verl] + 13, 0), new cv.Point(vel[verl] + 13, 480), [255, 255, 255, 0], 1);
            //answer A
            for (let n = vel[verl] + 6; n <= vel[verl] + 13; n++) {
                for (let j = start_left[pos - i % 4]; end_left[pos - i % 4] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CA++;
                    if (pix[0] > 170) {
                        A++;

                    }
                }
            }
            if (i % 4 % 3 === 2) {
                if ((A / CA) > preblack) {
                    strans = strans.concat("A");
                }
            } else {
                if ((A / CA) > pre) {
                    strans = strans.concat("A");
                }
            }
            // cv.line(templ, new cv.Point(vel[verl + 2] - 3, 0), new cv.Point(vel[verl + 2] - 3, 480), [255, 255, 255, 0], 1);
            // cv.line(templ, new cv.Point(vel[verl + 2] - 11, 0), new cv.Point(vel[verl + 2] - 11, 480), [255, 255, 255, 0], 1);
            //answer B
            for (let n = vel[verl + 2] - 11; n <= vel[verl + 2] - 3; n++) {
                for (let j = start_left[pos - i % 4]; end_left[pos - i % 4] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CB++;
                    if (pix[0] > 170) {
                        B++;
                    }
                }
            }
            if (i % 4 % 3 === 2) {
                if ((B / CB) > preblack) {
                    strans = strans.concat("B");
                }
            } else {
                if ((B / CB) > pre) {
                    strans = strans.concat("B");
                }
            }
            // cv.line(templ, new cv.Point(vel[verl + 3] - 2, 0), new cv.Point(vel[verl + 3] - 2, 480), [255, 255, 255, 0], 1);
            // cv.line(templ, new cv.Point(vel[verl + 3] - 9, 0), new cv.Point(vel[verl + 3] - 9, 480), [255, 255, 255, 0], 1);
            //answer C
            for (let n = vel[verl + 3] - 9; n <= vel[verl + 3] - 2; n++) {
                for (let j = start_left[pos - i % 4]; end_left[pos - i % 4] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CC++;
                    if (pix[0] > 170) {
                        C++;
                    }
                }
            }
            if (i % 4 % 3 === 2) {
                if ((C / CC) > preblack) {
                    strans = strans.concat("C");
                }
            } else {
                if ((C / CC) > pre) {
                    strans = strans.concat("C");
                }
            }
            // cv.line(templ, new cv.Point(vel[verl + 4] - 3, 0), new cv.Point(vel[verl + 4] - 3, 480), [255, 255, 255, 0], 1);
            // cv.line(templ, new cv.Point(vel[verl + 4] - 10, 0), new cv.Point(vel[verl + 4] - 10, 480), [255, 255, 255, 0], 1);
            //answer D
            for (let n = vel[verl + 4] - 10; n <= vel[verl + 4] - 3; n++) {
                for (let j = start_left[pos - i % 4]; end_left[pos - i % 4] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CD++;
                    if (pix[0] > 170) {
                        D++;
                    }
                }
            }
            if (i % 4 % 3 === 2) {
                if ((D / CD) > preblack) {
                    strans = strans.concat("D");
                }
            } else {
                if ((D / CD) > pre) {
                    strans = strans.concat("D");
                }
            }
            if (strans === "") {
                ans3[i] = "X";
            } else {
                if (strans.length > 1) {
                    strans = "O";
                }
                ans3[i] = strans;
            }
        } else if (i < 20) {
            let digit1 = "", digit2 = "", digit3 = "", digit4 = "";
            let fig = ["/", ".", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
            pos = section3B;
            for (let s = 0; s < 12; s++) {
                CA = 0, CB = 0, CC = 0, CD = 0;
                A = 0, B = 0, C = 0, D = 0, strans = "";
                verl = (i - 15) % 5 * 5;
                cv.line(templ, new cv.Point(vel[verl] + 8, 0), new cv.Point(vel[verl] + 8, 480), [255, 255, 255, 0], 1);
                cv.line(templ, new cv.Point(vel[verl + 1] - 5, 0), new cv.Point(vel[verl + 1] - 5, 480), [255, 255, 255, 0], 1);

                //answer A
                for (let n = vel[verl] + 8; n <= vel[verl + 1] - 5; n++) {
                    for (let j = start_left[pos - s]; end_left[pos - s] <= j; j--) {
                        let pix = gray.ucharPtr(j, n);
                        CA++;
                        if (pix[0] > 170) {
                            A++;

                        }
                    }
                }
                if (s != 0 || s != 2) {
                    if ((A / CA) > pre) {
                        digit1 = digit1.concat(fig[s]);
                        if (digit1.length > 1) {
                            digit1 = 'O';
                        }
                    }
                }

                cv.line(templ, new cv.Point(vel[verl + 1] + 14, 0), new cv.Point(vel[verl + 1] + 14, 480), [255, 255, 255, 0], 1);
                cv.line(templ, new cv.Point(vel[verl + 2] - 6, 0), new cv.Point(vel[verl + 2] - 6, 480), [255, 255, 255, 0], 1);
                //answer B
                for (let n = vel[verl + 1] + 14; n <= vel[verl + 2] - 6; n++) {
                    for (let j = start_left[pos - s]; end_left[pos - s] <= j; j--) {
                        let pix = gray.ucharPtr(j, n);
                        CB++;
                        if (pix[0] > 170) {
                            B++;
                        }
                    }
                }
                if ((B / CB) > pre) {
                    digit2 = digit2.concat(fig[s]);
                    if (digit2.length > 1) {
                        digit2 = 'O';
                    }
                }

                cv.line(templ, new cv.Point(vel[verl + 2] + 14, 0), new cv.Point(vel[verl + 2] + 14, 480), [255, 255, 255, 0], 1);
                cv.line(templ, new cv.Point(vel[verl + 3] - 6, 0), new cv.Point(vel[verl + 3] - 6, 480), [255, 255, 255, 0], 1);
                //answer C
                for (let n = vel[verl + 2] + 14; n <= vel[verl + 3] - 6; n++) {
                    for (let j = start_left[pos - s]; end_left[pos - s] <= j; j--) {
                        let pix = gray.ucharPtr(j, n);
                        CC++;
                        if (pix[0] > 170) {
                            C++;
                        }
                    }
                }

                if ((C / CC) > pre) {
                    digit3 = digit3.concat(fig[s]);
                    if (digit3.length > 1) {
                        digit3 = 'O';
                    }
                }
                cv.line(templ, new cv.Point(vel[verl + 3] + 14, 0), new cv.Point(vel[verl + 3] + 14, 480), [255, 255, 255, 0], 1);
                cv.line(templ, new cv.Point(vel[verl + 4] - 6, 0), new cv.Point(vel[verl + 4] - 6, 480), [255, 255, 255, 0], 1);

                //answer D
                for (let n = vel[verl + 3] + 14; n <= vel[verl + 4] - 6; n++) {
                    for (let j = start_left[pos - s]; end_left[pos - s] <= j; j--) {
                        let pix = gray.ucharPtr(j, n);
                        CD++;
                        if (pix[0] > 170) {
                            D++;
                        }
                    }
                }


                if (s != 0) {
                    if ((D / CD) > pre) {
                        digit4 = digit4.concat(fig[s]);
                        if (digit4.length > 1) {
                            digit4 = 'O';
                        }
                    }
                }


            }
            strans = ""

            ans3[i] = strans.concat(digit1, digit2, digit3, digit4);
            if (ans3[i] === "") {
                ans3[i] = 'X';
            }

        }

    }



    p2.innerHTML =
        ans1[0] + ans1[1] + ans1[2] + ans1[3] + ans1[4] + ans1[5] + ans1[6] + ans1[7]
        + ans1[8] + ans1[9] + ans1[10] + ans1[11] + ans1[12] + "<br>"
        + ans1[13] + ans1[14] + ans1[15] + ans1[16] + ans1[17] + ans1[18] + ans1[19] + ans1[20]
        + ans1[21] + ans1[22] + ans1[23] + ans1[24] + ans1[25] + "<br>"
        + ans1[26] + ans1[27] + ans1[28] + ans1[29] + ans1[30] + ans1[31] + ans1[32] + ans1[33]
        + ans1[34] + ans1[35] + ans1[36] + ans1[37] + ans1[38] + "<br>"
        + ans1[39] + ans1[40] + ans1[41] + ans1[42] + ans1[43] + ans1[44] + ans1[45] + ans1[46]
        + ans1[47] + ans1[48] + ans1[49] + ans1[50] + ans1[51] + "<br>" + "<br>" + "<br>"
        + ans2[0] + ans2[1] + ans2[2] + ans2[3] + ans2[4] + ans2[5] + ans2[6] + ans2[7]
        + ans2[8] + ans2[9] + ans2[10] + "<br>"
        + ans2[11] + ans2[12] + ans2[13] + ans2[14] + ans2[15] + ans2[16] + ans2[17] + ans2[18]
        + ans2[19] + ans2[20] + ans2[21] + "<br>"
        + ans2[22] + ans2[23] + ans2[24] + ans2[25] + ans2[26] + ans2[27] + ans2[28] + ans2[29]
        + ans2[30] + ans2[31] + ans2[32] + "<br>"
        + ans2[33] + ans2[34] + ans2[35] + ans2[36] + ans2[37] + ans2[38] + ans2[39] + ans2[40]
        + ans2[41] + ans2[42] + ans2[43] + "<br>" + "<br>" + "<br>"
        + ans3[0] + ans3[1] + ans3[2] + ans3[3] + "<br>"
        + ans3[4] + ans3[5] + ans3[6] + ans3[7] + "<br>"
        + ans3[8] + ans3[9] + ans3[10] + ans3[11] + "<br>"
        + ans3[12] + ans3[13] + ans3[14] + "<br>"
        + ans3[15] + "|" + ans3[16] + "|" + ans3[17] + "|" + ans3[18] + "|" + ans3[19] + "<br>";


    cv.imshow('outputCanvas_ori', gray);
    cv.imshow('outputCanvas', templ);
}
function Page2() {
    let i;
    let M1 = cv.Mat.ones(3, 3, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);
    let pos;
    cv.morphologyEx(gray, gray, cv.MORPH_OPEN, M1, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    cv.morphologyEx(gray, gray, cv.MORPH_CLOSE, M1, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    i = 0;
    //SECTION 4 
    //Answer 1~38
    templ = gray.clone();
    for (i = 0; i < 38; i++) {
        CA = 0, CB = 0, CC = 0, CD = 0;
        A = 0, B = 0, C = 0, D = 0, strans = "";
        if (i < 30) {
            pos = section4;
            verl = parseInt(i / 8) * 5;
            cv.line(templ, new cv.Point(vel[verl] + 10, 0), new cv.Point(vel[verl] + 10, 480), [255, 255, 255, 0], 1);
            cv.line(templ, new cv.Point(vel[verl + 1] - 6, 0), new cv.Point(vel[verl + 1] - 6, 480), [255, 255, 255, 0], 1);
            //answer A
            for (let n = vel[verl] + 10; n <= vel[verl + 1] - 6; n++) {
                for (let j = start_left[pos - i % 8]; end_left[pos - i % 8] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CA++;
                    if (pix[0] > 170) {
                        A++;

                    }
                }
            }
            if (i % 8 % 3 === 2) {
                if ((A / CA) > preblack) {
                    strans = strans.concat("A");
                }
            } else {
                if ((A / CA) > pre) {
                    strans = strans.concat("A");
                }
            }
            cv.line(templ, new cv.Point(vel[verl + 1] + 14, 0), new cv.Point(vel[verl + 1] + 14, 480), [255, 255, 255, 0], 1);
            cv.line(templ, new cv.Point(vel[verl + 2] - 6, 0), new cv.Point(vel[verl + 2] - 6, 480), [255, 255, 255, 0], 1);
            //answer B
            for (let n = vel[verl + 1] + 14; n <= vel[verl + 2] - 6; n++) {
                for (let j = start_left[pos - i % 8]; end_left[pos - i % 8] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CB++;
                    if (pix[0] > 170) {
                        B++;
                    }
                }
            }
            if (i % 8 % 3 === 2) {
                if ((B / CB) > preblack) {
                    strans = strans.concat("B");
                }
            } else {
                if ((B / CB) > pre) {
                    strans = strans.concat("B");
                }
            }
            cv.line(templ, new cv.Point(vel[verl + 2] + 14, 0), new cv.Point(vel[verl + 2] + 14, 480), [255, 255, 255, 0], 1);
            cv.line(templ, new cv.Point(vel[verl + 3] - 6, 0), new cv.Point(vel[verl + 3] - 6, 480), [255, 255, 255, 0], 1);
            //answer C
            for (let n = vel[verl + 2] + 14; n <= vel[verl + 3] - 6; n++) {
                for (let j = start_left[pos - i % 8]; end_left[pos - i % 8] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CC++;
                    if (pix[0] > 170) {
                        C++;
                    }
                }
            }
            if (i % 8 % 3 === 2) {
                if ((C / CC) > preblack) {
                    strans = strans.concat("C");
                }
            } else {
                if ((C / CC) > pre) {
                    strans = strans.concat("C");
                }
            }
            cv.line(templ, new cv.Point(vel[verl + 3] + 14, 0), new cv.Point(vel[verl + 3] + 14, 480), [255, 255, 255, 0], 1);
            cv.line(templ, new cv.Point(vel[verl + 4] - 6, 0), new cv.Point(vel[verl + 4] - 6, 480), [255, 255, 255, 0], 1);
            //answer D
            for (let n = vel[verl + 3] + 14; n <= vel[verl + 4] - 6; n++) {
                for (let j = start_left[pos - i % 8]; end_left[pos - i % 8] <= j; j--) {
                    let pix = gray.ucharPtr(j, n);
                    CD++;
                    if (pix[0] > 170) {
                        D++;
                    }
                }
            }
            if (i % 8 % 3 === 2) {
                if ((D / CD) > preblack) {
                    strans = strans.concat("D");
                }
            } else {
                if ((D / CD) > pre) {
                    strans = strans.concat("D");
                }
            }

            if (strans === "") {
                ans4[i] = "X";
            } else {
                if (strans.length > 1) {
                    strans = "O";
                }
                ans4[i] = strans;
            }
        }
        else if (i < 38) {
            let digit1 = "", digit2 = "", digit3 = "", digit4 = "";
            let fig = ["/", ".", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
            pos = section4B;
            if (i > 33) pos = 23;
            for (let s = 0; s < 12; s++) {
                CA = 0, CB = 0, CC = 0, CD = 0;
                A = 0, B = 0, C = 0, D = 0, strans = "";
                verl = (i - 30) % 4 * 5;
                //answer A
                for (let n = vel[verl] + 10; n <= vel[verl + 1] - 6; n++) {
                    for (let j = start_left[pos - s] - 1; end_left[pos - s] - 1 <= j; j--) {
                        let pix = gray.ucharPtr(j, n);
                        CA++;
                        if (pix[0] > 170) {
                            A++;

                        }
                    }
                }
                if (s != 0 || s != 2) {
                    if ((A / CA) > pre) {
                        digit1 = digit1.concat(fig[s]);
                        if (digit1.length > 1) {
                            digit1 = 'O';
                        }
                    }
                }


                //answer B
                for (let n = vel[verl + 1] + 14; n <= vel[verl + 2] - 6; n++) {
                    for (let j = start_left[pos - s] - 1; end_left[pos - s] - 1 <= j; j--) {
                        let pix = gray.ucharPtr(j, n);
                        CB++;
                        if (pix[0] > 170) {
                            B++;
                        }
                    }
                }
                if ((B / CB) > pre) {
                    digit2 = digit2.concat(fig[s]);
                    if (digit2.length > 1) {
                        digit2 = 'O';
                    }
                }


                //answer C
                for (let n = vel[verl + 2] + 14; n <= vel[verl + 3] - 6; n++) {
                    for (let j = start_left[pos - s] - 1; end_left[pos - s] - 1 <= j; j--) {
                        let pix = gray.ucharPtr(j, n);
                        CC++;
                        if (pix[0] > 170) {
                            C++;
                        }
                    }
                }

                if ((C / CC) > pre) {
                    digit3 = digit3.concat(fig[s]);
                    if (digit3.length > 1) {
                        digit3 = 'O';
                    }
                }

                //answer D
                for (let n = vel[verl + 3] + 14; n <= vel[verl + 4] - 6; n++) {
                    for (let j = start_left[pos - s] - 1; end_left[pos - s] - 1 <= j; j--) {
                        let pix = gray.ucharPtr(j, n);
                        CD++;
                        if (pix[0] > 170) {
                            D++;
                        }
                    }
                }


                if (s != 0) {
                    if ((D / CD) > pre) {
                        digit4 = digit4.concat(fig[s]);
                        if (digit4.length > 1) {
                            digit4 = 'O';
                        }
                    }
                }


            }
            strans = ""

            ans4[i] = strans.concat(digit1, digit2, digit3, digit4);
            if (ans4[i] === "") {
                ans4[i] = 'X';
            }



        }

    }




    //
    p2.innerHTML =
        ans4[0] + ans4[1] + ans4[2] + ans4[3] + ans4[4] + ans4[5] + ans4[6] + ans4[7] + "<br>"
        + ans4[8] + ans4[9] + ans4[10] + ans4[11] + ans4[12] + ans4[13] + ans4[14] + ans4[15] + "<br>"
        + ans4[16] + ans4[17] + ans4[18] + ans4[19] + ans4[20] + ans4[21] + ans4[22] + ans4[23] + "<br>"
        + ans4[24] + ans4[25] + ans4[26] + ans4[27] + ans4[28] + ans4[29] + "<br>"
        + ans4[30] + "--" + ans4[31] + "--" + ans4[32] + "--" + ans4[33] + "<br>"
        + ans4[34] + "--" + ans4[35] + "--" + ans4[36] + "--" + ans4[37];
    cv.imshow('outputCanvas_ori', src);
    cv.imshow('outputCanvas', templ);
}



// Config OpenCV
var Module = {
    locateFile: function (name) {
        let files = {
            "opencv_js.wasm": '/opencv/opencv_js.wasm'
        }
        return files[name]
    },
    preRun: [() => {

    }],
    postRun: [
        run
    ]
};