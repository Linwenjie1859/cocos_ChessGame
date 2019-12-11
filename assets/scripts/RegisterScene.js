/*
 * @Descripttion: 
 * @version: 
 * @Author: Mr. Lin
 * @Date: 2019-09-15 23:06:25
 * @LastEditors: Mr. Lin
 * @LastEditTime: 2019-11-01 20:23:17
 */
// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        loginButton: {
            default: null,
            type: cc.Node
        },
        registerNowButton: {
            default: null,
            type: cc.Node
        },
        usernameEditBox: {
            default: null,
            type: cc.EditBox
        },
        passwordEditBox: {
            default: null,
            type: cc.EditBox
        },
        msgLabel: {
            default: null,
            type: cc.Label
        },
    },



    onLoad() {
        this.loginButton.on(cc.Node.EventType.MOUSE_DOWN, function() {
            cc.director.loadScene('startScene');
        }, this);

        this.registerNowButton.on(cc.Node.EventType.MOUSE_DOWN, function() {
            var network = require("NetworkUtils");
            let sendData = [];
            let that = this;
            sendData['username'] = this.usernameEditBox.string;
            sendData['password'] = this.passwordEditBox.string;

            network.send('game/user/doRegister', sendData, function(res) {
                let data = JSON.parse(res);
                that.msgLabel.string = data.msg;
                if (data.code == 1) {
                    cc.director.loadScene('startScene');
                }
            }, null)
        }, this);
    },

    start() {

    },

    // update (dt) {},
});