/*
 * @Descripttion: 
 * @version: 
 * @Author: Mr. Lin
 * @Date: 2019-10-27 09:03:37
 * @LastEditors: Handsome Lin
 * @LastEditTime: 2019-12-01 11:16:54
 */
// 用法

// var network = require("NetworkUtils");

// network.send('URL',null,function(receiveData){

// console.log(receiveData);

// },null)


module.exports = {

    // urlBase: 'http://localhost:8082/api/',
    urlBase: 'http://gs.vswxx.top/api/', 

    send: function(url, data, onRecive, onError) {

        var sendData = '';

        if (data) {

            for (var key in data) {

                if (sendData === '')

                    sendData = key + '=' + data[key];

                else

                    sendData += '&' + key + '=' + data[key];

            }

        }

        var xhr = new XMLHttpRequest();



        xhr.onreadystatechange = function() {

            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {

                onRecive && onRecive(xhr.responseText);

            } else {

                onError && onError(xhr.responseText);

            }

        };

        xhr.open("POST", this.urlBase + url, true);

        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");
        xhr.setRequestHeader("XX-Token", sessionStorage.getItem('token'));

        xhr.send(sendData);

    }

};