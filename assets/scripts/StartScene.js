/*
 * @Descripttion: 
 * @version: 
 * @Author: Mr. Lin
 * @Date: 2019-09-15 23:06:25
 * @LastEditors: Handsome Lin
 * @LastEditTime: 2019-11-26 21:18:20
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
        playButton: {
            default: null,
            type: cc.Node
        },
        registerButton: {
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
        let that = this;
        this.gNode = new cc.Node('gNode');
        cc.game.addPersistRootNode(this.gNode);

        this.registerButton.on(cc.Node.EventType.MOUSE_DOWN, function() {
            cc.director.loadScene('registerScene');
        }, this);

        this.playButton.on(cc.Node.EventType.MOUSE_DOWN, function() {
            var network = require("NetworkUtils");
            let sendData = [];
            sendData['username'] = this.usernameEditBox.string;
            sendData['password'] = this.passwordEditBox.string;
            network.send('game/user/doLogin', sendData, function(res) {
                let data = JSON.parse(res);
                console.log(data);
                sessionStorage.setItem('token', data.data.token);
                sessionStorage.setItem('uid', data.data.id);
                if (data.code == 1) {
                    cc.director.loadScene('mainScene');
                } else {
                    that.msgLabel.string = data.msg;
                }
            }, null)
        }, this);
    },

    start() {

    },

    // update (dt) {},
});