/*
 * @Descripttion: 
 * @version: 
 * @Author: Mr. Lin
 * @Date: 2019-10-12 23:36:57
 * @LastEditors: Mr. Lin
 * @LastEditTime: 2019-10-13 08:01:07
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
        winerName: {
            default: null,
            type: cc.Label
        },
    },



    onLoad() {
        this.gNode = cc.find("gNode");
        this.winerName.string = this.gNode.winer == 1 ? 'Congratulations, Red Victory！' : 'Congratulations, Black Victory！';
        this.playButton.on(cc.Node.EventType.MOUSE_DOWN, function() {
            cc.director.loadScene('gameScene');
        }, this);
    },

    start() {

    },

    // update (dt) {},
});