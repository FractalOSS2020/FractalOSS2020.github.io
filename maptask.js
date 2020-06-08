
// 위도,경도를 이용하여 거리를 구하는 함수
function getDistanceFromLatLonInKm(lat1,lng1,lat2,lng2) {
    lat1 = parseFloat(lat1);
    lng1 = parseFloat(lng1);
    lat2 = parseFloat(lat2);
    lng2 = parseFloat(lng2);
    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lng2-lng1);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km

    return d;
}



var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = { 
        center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
        level: 4 // 지도의 확대 레벨 
    }; 

var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

var imageSrc1 = 'img/markerGreen.png', // 마커이미지의 주소입니다    
    imageSize = new kakao.maps.Size(24, 35), // 마커이미지의 크기입니다
    // imageOption = {offset: new kakao.maps.Point(27, 69)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
    // 마커 이미지를 생성합니다    
    markerImage1 = new kakao.maps.MarkerImage(imageSrc1, imageSize);
var imageSrc2 = 'img/markerYellow.png',     
    markerImage2 = new kakao.maps.MarkerImage(imageSrc2, imageSize);
var imageSrc3 = 'img/markerRed.png',     
    markerImage3 = new kakao.maps.MarkerImage(imageSrc3, imageSize);
var imageSrc4 = 'img/markerGray.png',     
    markerImage4 = new kakao.maps.MarkerImage(imageSrc4, imageSize);
var imageSrc5 = 'img/markerGreenReco.png',     
    markerImage5 = new kakao.maps.MarkerImage(imageSrc5, imageSize);
var imageSrc6 = 'img/markerYellowReco.png',     
    markerImage6 = new kakao.maps.MarkerImage(imageSrc6, imageSize);

function getAddress(lon, lat){
    return new Promise( function (resolve, reject) {
        var callback = function(result, status) {
            if (status === kakao.maps.services.Status.OK) {
                console.log('지역 명칭 : ' + result[0].address_name);
                console.log('행정구역 코드 : ' + result[0].code);
                addName = result[0].address_name;
                console.log('addName : ' + addName);

                // //동 이하 주소들 빼는 작업
                // temp1 = addName.indexOf(' ');
                // addName1 = addName.slice(0,temp1+1);
                // addName2 = addName.slice(temp1+1);
                // temp2 = addName2.indexOf(' ');
                // addName3 = addName2.slice(0,temp2);
                // addName = addName1+addName3;

                resolve(addName);
            }
            else {
                reject(result);
            }
        };
        geocoder.coord2RegionCode(lon, lat, callback);
    })
}

const stat_string = {
    "plenty" : "많음",
    "some" : "적당",
    "few" : "거의 없음",
    "empty" : "품절",
    "break" : "판매 중단"
}



// HTML5의 geolocation으로 사용할 수 있는지 확인합니다 
if (navigator.geolocation) {
    
    // GeoLocation을 이용해서 접속 위치를 얻어옵니다
    navigator.geolocation.getCurrentPosition(function(position) {
        lat = position.coords.latitude, // 위도
        lon = position.coords.longitude; // 경도

        // // 임시좌표(제주시청)
        // lat = 33.499529,
        // lon = 126.531107;
        // //임시좌표(한라병원)
        // lat = 33.489976,
        // lon = 126.485099;

        var currentPosition = [lat, lon];

        var locPosition = new kakao.maps.LatLng(lat, lon), // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
            // 인포윈도우에 표시될 내용입니다
            // message = String(lat) + '<br>' + String(lon);
            message =  '<div style="padding:5px;">'+ '현위치' +'</div>'
        
        // 마커와 인포윈도우를 표시합니다
        displayMarker(locPosition, message);

        geocoder = new kakao.maps.services.Geocoder();
        getAddress(lon, lat).then(function(address){
            console.log("address : " + address);
            const filter = ["plenty", "some", "few", "empty", "break"]

            //이후 작업은 여기에
            return getDatas(address, filter)
        /* ------ 추가 필터링한것만 내보내는 방법
        // }).then(function (seller_list) {
        //     // 필터 모두 다 체크된걸로 들어옴.
        //     console.log(seller_list);
            
        //     // 그 중에서 필터링하는 부분
        //     const filtered = Array.from(seller_list).filter(function (seller) {
        //         return seller.remain_stat == "plenty"
        //     })
        //     console.log("filtered", filtered)
        //     return filtered
        // }).then(function(filtered){
        //     //이전에 처리된 값을 filtered로 받음.
        //     // 지도로 띄울 부분을 받아온 filtered로 구현.
        //     Array.from(filtered).forEach(function (seller) {
        //         addMarker([seller.lat, seller.lng], stat_string[seller.remain_stat])
        //     })
        // ------ */
        }).then(function (seller_list) {
            // 필터 모두 다 체크된걸로 들어옴.
            console.log(seller_list);

            // 지도로 띄울 부분
            Array.from(seller_list).forEach(function (seller) {
                message = seller.name + '<br>' + stat_string[seller.remain_stat]
                var sellerPosition = [seller.lat, seller.lng]
                seller.distance = getDistanceFromLatLonInKm(currentPosition[0], currentPosition[1], sellerPosition[0], sellerPosition[1])
                addMarker2([seller.lat, seller.lng], message, seller.remain_stat, seller.distance)
            })
            
            // // 거리순으로 배열
            // seller_list = seller_list.sort(function (a,b) {
            //     return a.distance < b.distance ? -1 : a.distance > b.distance ? 1 : 0;
            // })
            // console.log(seller_list)
        

            // Array.from(seller_list).forEach(function (seller) {
                // console.log(seller_list)
                // console.log(seller.distance)
            // });
        });
    }); 
} else { // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용을 설정합니다
    
    var locPosition = new kakao.maps.LatLng(33.450701, 126.570667),    
        message = '현재위치를 가져올 수 없습니다.'
        
    displayMarker(locPosition, message);
}

// 지도에 마커와 인포윈도우를 표시하는 함수입니다
function displayMarker(locPosition, message) {

    // 마커를 생성합니다
    var marker = new kakao.maps.Marker({  
        map: map, 
        position: locPosition
    }); 
    
    var iwContent = message, // 인포윈도우에 표시할 내용
        iwRemoveable = true;

    // 인포윈도우를 생성합니다
    var infowindow = new kakao.maps.InfoWindow({
        content : iwContent,
        removable : iwRemoveable
    });
    
    // 인포윈도우를 마커위에 표시합니다 
    infowindow.open(map, marker);
    
    // 지도 중심좌표를 접속위치로 변경합니다
    map.setCenter(locPosition);      
}


function addMarker(locPosition, message) {
    // console.log("Position", locPosition, "message", message)

    // 마커를 클릭했을 때 마커 위에 표시할 인포윈도우를 생성합니다
    var iwContent = '<div style="padding:5px;">'+ message +'</div>', // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다
        iwRemoveable = true; // removeable 속성을 ture 로 설정하면 인포윈도우를 닫을 수 있는 x버튼이 표시됩니다

    var infowindow = new kakao.maps.InfoWindow({
        content : iwContent,
        removable : iwRemoveable
    });

    // 마커를 생성합니다
    var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(locPosition[0], locPosition[1]),
        title: message,
    });

    infowindow.open(map, marker);

    // 마커에 클릭이벤트를 등록합니다
    kakao.maps.event.addListener(marker, 'click', function() {
        // 마커 위에 인포윈도우를 표시합니다
        infowindow.open(map, marker);  
    });
}

// 가까운 약국 5곳을 찾는 함수
// function nearSeller(locPosition, seller_list) {
//     for (var i=0; i<5; i++){
//         if (locPosition[0] == seller_list[i].lat && locPosition[1] == seller_list[i].lng) {
//             console.log('엡 ㅔ베베베베베베베베')
//             console.log(seller_list, locPosition)
//             return true
//         }
//         else {
//             continue
//         }
//     }
// }


//인포윈도우 없이 마커 추가하기
function addMarker2(locPosition, message, remain_stat, distance) {
    // console.log("Position", locPosition, "message", message)
    // console.log("remain", remain_stat)
    // console.log(distance)
    
    // 마커를 클릭했을 때 마커 위에 표시할 인포윈도우를 생성합니다
    var iwContent = '<div style="padding:5px;">'+ message +'</div>', // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다
        iwRemoveable = true; // removeable 속성을 ture 로 설정하면 인포윈도우를 닫을 수 있는 x버튼이 표시됩니다
    
    // 인포윈도우를 생성합니다
    var infowindow = new kakao.maps.InfoWindow({
        content : iwContent,
        removable : iwRemoveable
    });
    if (remain_stat=="plenty"){
        if (distance < 2.5) {
            var marker2 = new kakao.maps.Marker({
                map: map,
                position: new kakao.maps.LatLng(locPosition[0], locPosition[1]),
                title: message,
                image: markerImage5
            });
        }
        else {
            var marker2 = new kakao.maps.Marker({
                map: map,
                position: new kakao.maps.LatLng(locPosition[0], locPosition[1]),
                title: message,
                image: markerImage1
            });
        }
    } else if (remain_stat=='some'){
        // 마커를 생성합니다   
        if (distance < 2.5) {
            var marker2 = new kakao.maps.Marker({
                map: map,
                position: new kakao.maps.LatLng(locPosition[0], locPosition[1]),
                title: message,
                image: markerImage6
            });
        }
        else {
            var marker2 = new kakao.maps.Marker({
                map: map,
                position: new kakao.maps.LatLng(locPosition[0], locPosition[1]),
                title: message,
                image: markerImage2
            });
        }    
    } else if (remain_stat=="few"){
        // 마커를 생성합니다
        var marker2 = new kakao.maps.Marker({
            map: map,
            position: new kakao.maps.LatLng(locPosition[0], locPosition[1]),
            title: message,
            image: markerImage3
    });
    } else if (remain_stat=="empty" || remain_stat=="break"){
        // 마커를 생성합니다
        var marker2 = new kakao.maps.Marker({
            map: map,
            position: new kakao.maps.LatLng(locPosition[0], locPosition[1]),
            title: message,
            image: markerImage4
    });
    } else{
        // 마커를 생성합니다
        var marker2 = new kakao.maps.Marker({
            map: map,
            position: new kakao.maps.LatLng(locPosition[0], locPosition[1]),
            title: message
    });
    }

    // 마커에 클릭이벤트를 등록합니다
    kakao.maps.event.addListener(marker2, 'click', function() {
        // 마커 위에 인포윈도우를 표시합니다
        infowindow.open(map, marker2);  
    });
    

    // var infowindow = new kakao.maps.InfoWindow({
    //     content : message,
    //     removable : true
    // });

    // infowindow.open(map, marker);
}

function getAdd(callback, addName){

}

////////////////////