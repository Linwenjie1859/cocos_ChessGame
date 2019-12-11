/*
 * @Descripttion: 
 * @version: 
 * @Author: Mr. Lin
 * @Date: 2019-09-15 23:06:25
 * @LastEditors: Handsome Lin
 * @LastEditTime: 2019-12-01 11:21:44
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
        matching: {
            default: null,
            type: cc.Node
        },
        cancleButton: {
            default: null,
            type: cc.Node
        },
        matchLabel: {
            default: null,
            type: cc.Label
        },
    },


    onLoad() {
        this.gNode = cc.find("gNode");
        this.gNode.token = sessionStorage.getItem('token');

        this.matching.active = false; //隐藏遮罩
        this.matchingAnimation = this.node.getComponent(cc.Animation);

        var that = this;
        this.playButton.on(cc.Node.EventType.MOUSE_DOWN, function() {
            that.matching.active = true; //当点击play之后出现遮罩进行匹配
            that.matchingAnimation.play('matching');
            that.match();
            that.schedule(that.match, 5);
        }, this);
    },
    match() {
        var that = this;
        var network = require("NetworkUtils");
        let sendData = [];
        network.send('game/game/match', sendData, function(res) {
            var res = JSON.parse(res);
            console.log(res);
            if (res.code == 1 && res.data.id != 0) {
                that.unschedule(that.match);
                var currentTime = Math.floor(Date.parse(new Date()) / 1000);
                that.dt = res.server_time - currentTime;
                console.log('时间差:', that.dt);
                that.countDown = res.data.start_time - that.dt - currentTime;
                that.cancleButton.active = false;
                that.schedule(that.countDownAnimation, 1);
                sessionStorage.setItem('id', res.data.id); //将游戏的id保存下来,用于后期的和后端交互
            }
        }, null);
    },
    countDownAnimation() {
        this.countDown = this.countDown - 1; 
        if (this.countDown <= 0) {
            this.countDown = 0;
            cc.director.loadScene('gameScene');
        }
        this.matchLabel.string = this.countDown;
    },
    start() {

    },

    // update (dt) {},
});