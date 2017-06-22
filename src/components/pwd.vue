<style>

.masks {
    text-align: center;
    position: fixed;
    z-index: 1000;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
}
.gesturePwd{
    position: fixed;
    z-index: 5000;
    width: 100%;
    height:100%;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%,-50%);
    transform: translate(-50%,-50%);
    background-color: #666;
    text-align: center;
    border-radius: 3px;
    overflow: hidden;
    background-color: #000;
}

.gestureTitle {
    color: #87888a;
    margin-top: 85px;
    font-size: 20px;
    font-weight:normal;
}

</style> 

<template>    
    <div class="masks" v-show="currentValue"  >

        <div class="gesturePwd" >
        
            <div style="position: absolute;top:0;left:0;right:0;bottom:0;">
                <h4 ref="gestureTitle" class="gestureTitle" >请绘制您的图形密码</h4>
                <a ref="updatePassword" style="position: absolute;left: 5px;top: 5px;color:#fff;font-size: 13px;display:block;" @click="updatePassword()">重置密码</a>

                <a ref="updatePassword" style="position: absolute;right: 5px;top: 5px;color:#fff;font-size: 13px;display:block;" @click="closePwd()">关闭</a>
              
              <canvas ref="canvas" style="background-color:#000; display: inline-block; margin-top: 76px; width: 320px; height: 320px;"></canvas>
                
            </div>
        </div>
    </div>

     
</template>

<script>


export default {
    props: {
        value: {
          type: Boolean,
          default: false
        },
    },
  data() {
    return {

      currentValue: false,


      ctx:'',
      width:0,
      height:0,
      devicePixelRatio:0,
      chooseType : '',
      r :'',// 公式计算
      lastPoint: [],
      arr : [],
      restPoint :[],
      pswObj:{step:2},
      canvas:''
    }
  },
  watch: {
    value: {
      handler: function (val) {
        this.currentValue = val
      },
      immediate: true
    },
    currentValue (val) {
      this.$emit(val ? 'on-show' : 'on-hide')
      this.$emit('input', val)
    }
  },
  created () {
    if (typeof this.value !== 'undefined') {
      this.currentValue = this.value
    }
  },
  mounted() {
      this.setChooseType(3);
  },
  methods: {

    closePwd () {
        console.log('关闭界面');
        this.currentValue = false;

    },

    H5lock (obj){

        this.height = obj.height;
        this.width = obj.width;
        this.chooseType = Number(window.localStorage.getItem('chooseType')) || obj.chooseType;
        this.devicePixelRatio = window.devicePixelRatio || 1;
    },
    drawCle (x, y) { // 初始化解锁密码面板 小圆圈
        this.ctx.strokeStyle = '#87888a';//密码的点点默认的颜色
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.stroke();
    },
    drawPoint (style) { // 初始化圆心
        for (var i = 0 ; i < this.lastPoint.length ; i++) {
            this.ctx.fillStyle = style;
            this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r / 2.5, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.fill();
        }
    },
    drawStatusPoint (type) { // 初始化状态线条
        for (var i = 0 ; i < this.lastPoint.length ; i++) {
            this.ctx.strokeStyle = type;
            this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
        }
    },
    drawLine (style, po, lastPoint) {//style:颜色 解锁轨迹
        this.ctx.beginPath();
        this.ctx.strokeStyle = style;
        this.ctx.lineWidth = 3;
        this.ctx.moveTo(this.lastPoint[0].x, this.lastPoint[0].y);

        for (var i = 1 ; i < this.lastPoint.length ; i++) {
            this.ctx.lineTo(this.lastPoint[i].x, this.lastPoint[i].y);
        }
        this.ctx.lineTo(po.x, po.y);
        this.ctx.stroke();
        this.ctx.closePath();

    },
    createCircle () {// 创建解锁点的坐标，根据canvas的大小来平均分配半径

        var n = this.chooseType;
        var count = 0;
        this.r = this.ctx.canvas.width / (2 + 4 * n);// 公式计算
        this.lastPoint = [];
        this.arr = [];
        this.restPoint = [];
        var r = this.r;
        for (var i = 0 ; i < n ; i++) {
            for (var j = 0 ; j < n ; j++) {
                count++;
                var obj = {
                    x: j * 4 * r + 3 * r,
                    y: i * 4 * r + 3 * r,
                    index: count
                };
                this.arr.push(obj);
                this.restPoint.push(obj);
            }
        }
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for (var i = 0 ; i < this.arr.length ; i++) {
            this.drawCle(this.arr[i].x, this.arr[i].y);
           
        }

        //return arr;
    },
    getPosition (e) {// 获取touch点相对于canvas的坐标
        var rect = e.currentTarget.getBoundingClientRect();
        var po = {
            x: (e.touches[0].clientX - rect.left)*this.devicePixelRatio,
            y: (e.touches[0].clientY - rect.top)*this.devicePixelRatio
          };
        return po;
    },
    update(po) {// 核心变换方法在touchmove时候调用
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for (var i = 0 ; i < this.arr.length ; i++) { // 每帧先把面板画出来
            this.drawCle(this.arr[i].x, this.arr[i].y);
        }

        this.drawPoint('#27AED5');// 每帧花轨迹
        this.drawStatusPoint('#27AED5');// 每帧花轨迹

        this.drawLine('#27AED5',po , this.lastPoint);// 每帧画圆心

        for (var i = 0 ; i < this.restPoint.length ; i++) {
            if (Math.abs(po.x - this.restPoint[i].x) < this.r && Math.abs(po.y - this.restPoint[i].y) < this.r) {
                this.drawPoint(this.restPoint[i].x, this.restPoint[i].y);
                this.lastPoint.push(this.restPoint[i]);
                this.restPoint.splice(i, 1);
                break;
            }
        }

    },
    checkPass (psw1, psw2) {// 检测密码
        var p1 = '',
        p2 = '';
        for (var i = 0 ; i < psw1.length ; i++) {
            p1 += psw1[i].index + psw1[i].index;
        }
        for (var i = 0 ; i < psw2.length ; i++) {
            p2 += psw2[i].index + psw2[i].index;
        }
        return p1 === p2;
    },
    storePass (psw) {// touchend结束之后对密码和状态的处理

        if (this.pswObj.step == 1) {
            if (this.checkPass(this.pswObj.fpassword, psw)) {
                this.pswObj.step = 2;
                this.pswObj.spassword = psw;
                this.$refs.gestureTitle.innerHTML = '密码保存成功';
                

                this.drawStatusPoint('#2CFF26');
                this.drawPoint('#2CFF26');
                window.localStorage.setItem('passwordxx', JSON.stringify(this.pswObj.spassword));
                window.localStorage.setItem('chooseType', this.chooseType);
            } else {
                this.$refs.gestureTitle.innerHTML = '两次不一致，重新输入';
                this.drawStatusPoint('red');
                 this.drawPoint('red');
                delete this.pswObj.step;
            }
        } else if (this.pswObj.step == 2) {
            if (this.checkPass(this.pswObj.spassword, psw)) {
                var gestureTitle = this.$refs.gestureTitle;
                gestureTitle.style.color = "#2CFF26";
                gestureTitle.innerHTML = '解锁成功';

                this.drawStatusPoint('#2CFF26');//小点点外圈高亮
                this.drawPoint('#2CFF26');
                this.drawLine('#2CFF26',this.lastPoint[this.lastPoint.length-1] , this.lastPoint);// 每帧画圆心
                
                
                this.closePwd();

            } else if (psw.length < 4) {
                
                this.drawStatusPoint('red');
                this.drawPoint('red');
                this.drawLine('red',this.lastPoint[this.lastPoint.length-1] , this.lastPoint);// 每帧画圆心

                var gestureTitle = this.$refs.gestureTitle;
                gestureTitle.style.color = "red";
                gestureTitle.innerHTML = '请连接4个点';

            } else {
                this.drawStatusPoint('red');
                this.drawPoint('red');
                this.drawLine('red',this.lastPoint[this.lastPoint.length-1] , this.lastPoint);// 每帧画圆心


                var gestureTitle = this.$refs.gestureTitle;
                gestureTitle.style.color = "red";
                gestureTitle.innerHTML = '密码错误，您还可以输入N次';
            }
        } else {
            this.pswObj.step = 1;
            this.pswObj.fpassword = psw;
            this.$refs.gestureTitle.innerHTML = '再次输入';
        }

    },
    makeState () {

        if (this.pswObj.step == 2) {
            this.$refs.updatePassword.style.display = 'block';


            var gestureTitle = this.$refs.gestureTitle;
            gestureTitle.style.color = "#87888a";
            gestureTitle.innerHTML = '请解锁';

        } else if (this.pswObj.step == 1) {

            this.$refs.updatePassword.style.display = 'none';
        } else {
          

            this.$refs.updatePassword.style.display =  'block';
            // this.$refs.updatePassword.style.display  = 'block';
        }
    },
    setChooseType (type){
        this.chooseType = type;
        this.init();
    },
    updatePassword (){
        window.localStorage.removeItem('passwordxx');
        window.localStorage.removeItem('chooseType');
        this.pswObj = {};
        this.$refs.gestureTitle.innerHTML = '绘制解锁图案';
        this.reset();
    },
    initDom (){
     
        
        this.chooseType = Number(window.localStorage.getItem('chooseType')) || 3;
        this.devicePixelRatio = window.devicePixelRatio || 1;

        var canvas = this.$refs.canvas;

        var width = this.width || 320;
        var height = this.height || 320;

        // 高清屏锁放
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        canvas.height = height * this.devicePixelRatio;
        canvas.width = width * this.devicePixelRatio;



    },
    init () {

        this.initDom();
        this.pswObj = window.localStorage.getItem('passwordxx') ? {
            step: 2,
            spassword: JSON.parse(window.localStorage.getItem('passwordxx'))
        } : {};
        this.lastPoint = [];
        this.makeState();
        this.touchFlag = false;

        this.canvas = this.$refs.canvas;
      
        this.ctx = this.canvas.getContext('2d');
        this.createCircle();
        this.bindEvent();
    },
    reset () {
        this.makeState();
        this.createCircle();
    },
    bindEvent () {

        var self = this;
        this.canvas = this.$refs.canvas;
        this.canvas.addEventListener("touchstart", function (e) {
            e.preventDefault();// 某些android 的 touchmove不宜触发 所以增加此行代码
             var po = self.getPosition(e);

             for (var i = 0 ; i < self.arr.length ; i++) {
                if (Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r) {

                    self.touchFlag = true;
                    self.drawPoint(self.arr[i].x,self.arr[i].y);
                    self.lastPoint.push(self.arr[i]);
                    self.restPoint.splice(i,1);
                    break;
                }
             }
         }, false);
         this.canvas.addEventListener("touchmove", function (e) {
            if (self.touchFlag) {
                self.update(self.getPosition(e));
            }
         }, false);
         this.canvas.addEventListener("touchend", function (e) {
             if (self.touchFlag) {
                 self.touchFlag = false;
                 self.storePass(self.lastPoint);

                 setTimeout(function(){

                    self.reset();
                }, 1000);
             }


         }, false);
 
      }
   
  }
}
</script>
