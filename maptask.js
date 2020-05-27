var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = { 
        center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
        level: 4 // 지도의 확대 레벨 
    }; 

var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

function getAddress(lon, lat)
{
    return new Promise( function (resolve, reject) {
        var callback = function(result, status) {
            if (status === kakao.maps.services.Status.OK) {
                console.log('지역 명칭 : ' + result[1].address_name);
                console.log('행정구역 코드 : ' + result[1].code);
                addName = result[1].address_name;

                //동 이하 주소들 빼는 작업
                temp1 = addName.indexOf(' ');
                addName1 = addName.slice(0,temp1+1);
                addName2 = addName.slice(temp1+1);
                temp2 = addName2.indexOf(' ');
                addName3 = addName2.slice(0,temp2);
                addName = addName1+addName3;

                resolve(addName)
            }
            else {
                reject(result)
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

        var locPosition = new kakao.maps.LatLng(lat, lon), // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
            // 인포윈도우에 표시될 내용입니다
            message = String(lat) + '<br>' + String(lon);
        
        // 마커와 인포윈도우를 표시합니다
        displayMarker(locPosition, message);

        geocoder = new kakao.maps.services.Geocoder();
        getAddress(lon, lat).then(function(address){
            console.log("address : " + address);
            const filter = ["plenty", "some", "few", "empty", "break"]

            //이후 작업은 여기에
            return getDatas(address, filter)
        }).then(function (seller_list) {
            // 필터 모두 다 체크된걸로 들어옴.
            console.log(seller_list);
            
            // 그 중에서 필터링하는 부분
            const filtered = Array.from(seller_list).filter(function (seller) {
                return seller.remain_stat == "plenty"
            })
            console.log("filtered", filtered)
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


function getAdd(callback, addName){

}