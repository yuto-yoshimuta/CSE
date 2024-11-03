
<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light" >
        <div class="container">
            <div class="container-sm-first">
                <a class="navbar-brand" href="#" id="center">
                    <img src="C:\Users\ca775\Desktop\moneyexplanation\image\logo.jpg" alt="" width="30" height="24" >
                    <div class="d-inline-block align-text-top" >CashScanExploler</div>
                </a>
            </div>
                

        
            <div class="btn-group" role="group" aria-label="Basic outlined example" id="btcolor">
                <button type="button" class="btn btn-outline-primary">HOME</button>
                <button type="button" class="btn btn-outline-primary">EXPLOLER</button>
                <button type="button" class="btn btn-outline-primary">KNOWLEDGE</button>
                <button type="button" class="btn btn-outline-primary">NEWS</button>
            </div>
            
            
        </div>

    </nav>
    
    <div class="container">
        <div class="row align-items-start">
            <div class="col-2">
                <div class="dropdown" id="space">
                    <button class="btn btn-primary dropdown-toggle"  type="button" data-bs-toggle="dropdown" aria-expanded="false" id ="yellow">
                        JPY
                    </button>
                    <ul class="dropdown-menu dropdown-menu-white">
                        <li><a class="dropdown-item" href="#" @click="jpy1">1 JPY</a></li>
                        <li><a class="dropdown-item" href="#" @click="jpy5">5 JPY</a></li>
                        <li><a class="dropdown-item" href="#" @click="jpy10">10 JPY</a></li>
                        <li><a class="dropdown-item" href="#" @click="jpy50">50 JPY</a></li>
                        <li><a class="dropdown-item" href="#" @click="jpy100">100 JPY</a></li>
                        <li><a class="dropdown-item" href="#" @click="jpy500">500 JPY</a></li>
                        <li><a class="dropdown-item" href="#" @click="jpy1000">1000 JPY</a></li>
                        <li><a class="dropdown-item" href="#" @click="jpy5000">5000 JPY</a></li>
                        <li><a class="dropdown-item" href="#" @click="jpy10000">10000 JPY</a></li>

                    </ul>
                </div>
                <img src="C:\Users\ca775\Desktop\moneyexplanation\image\other\life.png" id="sizeforImage">
            </div>
            <div class="col-2">
                <div class="dropdown" id="space">
                    <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="blue">
                        NTD
                    </button>
                    <ul class="dropdown-menu dropdown-menu-white" >
                        <li><a class="dropdown-item" href="#" @click="twd1">1 NTD</a></li>
                        <li><a class="dropdown-item" href="#" @click="twd5">5 NTD</a></li>
                        <li><a class="dropdown-item" href="#" @click="twd10">10 NTD</a></li>
                        <li><a class="dropdown-item" href="#" @click="twd50">50 NTD</a></li>
                        <li><a class="dropdown-item" href="#" @click="twd100">100 NTD</a></li>
                        <li><a class="dropdown-item" href="#" @click="twd500">500 NTD</a></li>
                        <li><a class="dropdown-item" href="#" @click="twd1000">1000 NTD</a></li>
                    </ul>
                </div>
            </div>
            
        
            <div class="col-8" >
                <div class="card mb-3" id="space">
                    <Transion mode="out-in">
                        <div v-if="state === 'jpy1'"><img src="C:/Users/ca775/Desktop/moneyexplanation/image/JPY/1.jpg" class="card-img-top" alt="picture"></div>
                        <div v-if="state === 'jpy5'"><img src="C:/Users/ca775/Desktop/moneyexplanation/image/JPY/5.jpg" class="card-img-top" alt="picture"></div>
                        <div v-if="state === 'jpy10'"><img src="C:/Users/ca775/Desktop/moneyexplanation/image/JPY/10.jpg" class="card-img-top" alt="picture"></div>
                        <div v-if="state === 'jpy50'"><img src="C:/Users/ca775/Desktop/moneyexplanation/image/JPY/50.jpg" class="card-img-top" alt="picture"></div>
                        <div v-if="state === 'jpy100'"><img src="C:/Users/ca775/Desktop/moneyexplanation/image/JPY/100.jpg" class="card-img-top" alt="picture"></div>
                        <div v-if="state === 'jpy500'"><img src="C:/Users/ca775/Desktop/moneyexplanation/image/JPY/500.jpg" class="card-img-top" alt="picture"></div>
                        <div v-if="state === 'jpy1000'"><img src="C:/Users/ca775/Desktop/moneyexplanation/image/JPY/1000.jpg" class="card-img-top" alt="picture"></div>
                        <div v-if="state === 'jpy5000'"><img src="C:/Users/ca775/Desktop/moneyexplanation/image/JPY/5000.jpg" class="card-img-top" alt="picture"></div>
                        <div v-if="state === 'jpy10000'"><img src="C:/Users/ca775/Desktop/moneyexplanation/image/JPY/10000.jpg" class="card-img-top" alt="picture"></div>
                        <div v-if="state === 'twd1'"><img src="C:/Users/ca775/Desktop/moneyexplanation/image/TWD/1.jpg" class="card-img-top" alt="picture"></div>
                        <div v-if="state === 'twd5'"><img src="C:/Users/ca775/Desktop/moneyexplanation/image/TWD/5.jpg" class="card-img-top" alt="picture"></div>
                        <div v-if="state === 'twd10'"><img src="C:/Users/ca775/Desktop/moneyexplanation/image/TWD/10.jpg" class="card-img-top" alt="picture"></div>
                        <div v-if="state === 'twd50'"><img src="C:/Users/ca775/Desktop/moneyexplanation/image/TWD/50.jpg" class="card-img-top" alt="picture"></div>
                        <div v-if="state === 'twd100'"><img src="C:/Users/ca775/Desktop/moneyexplanation/image/TWD/100.jpg" class="card-img-top" alt="picture"></div>
                        <div v-if="state === 'twd500'"><img src="C:/Users/ca775/Desktop/moneyexplanation/image/TWD/500.jpg" class="card-img-top" alt="picture"></div>
                        <div v-if="state === 'twd1000'"><img src="C:/Users/ca775/Desktop/moneyexplanation/image/TWD/1000.jpg" class="card-img-top" alt="picture"></div>

                    
                    </Transion>
                    
                    <div class="card-body">
                        <div></div>
                        <h5 class="card-title" id ="line">{{ text1 }}</h5>
                        <p class="card-text">{{ text2 }}</p>
                    </div>
                </div>
            </div>


        </div>
        

    </div>


    

</template>

<script setup>
import { ref } from 'vue'

const text1 = ref('1 JPY')
const text2 = ref('The one yen coin is the smallest denomination coin in Japan, made of aluminum. It is very light, weighing 1 gram. It features "1 yen" on the obverse side and a design of young trees on the reverse.')
const state = ref("jpy1")

function jpy1(){
   console.log("heii")
   text1.value = ('1 JPY')
   text2.value = ('The one yen coin is the smallest denomination coin in Japan, made of aluminum. It is very light, weighing 1 gram. It features "1 yen" on the obverse side and a design of young trees on the reverse.')
   state.value = ("jpy1")
}

function jpy5(){
   console.log("heii2")
   text1.value = ('5 JPY')
   text2.value = ("The five yen coin is made of brass and has a distinctive hole in the center. It depicts ears of rice, waves, and a gear on the obverse side, symbolizing agriculture, fisheries, and industry in Japan.")
   state.value = ("jpy5")
}

function jpy10(){
   console.log("heii2")
   text1.value = ('10 JPY')
   text2.value = ("The ten yen coin is made of bronze and features the Byodo-in Phoenix Hall on the obverse side. There are both milled and smooth edge variations. The current design of the ten yen coin was first issued in 1951. Earlier versions of the ten yen coin had different designs and materials.")
   state.value = ("jpy10")
}

function jpy50(){
   console.log("heii2")
   text1.value = ('50 JPY')
   text2.value = ("The fifty yen coin is made of cupronickel and has a central hole. It features a chrysanthemum flower on the obverse. The fifty yen coin was introduced in 1959 with the current cupronickel design. Previous versions had different designs and materials.")
   state.value = ("jpy50")
}

function jpy100(){
   console.log("heii2")
   text1.value = ('100 JPY')
   text2.value = ("The one hundred yen coin is made of cupronickel and features a cherry blossom motif on the obverse. The one hundred yen coin was first issued in 1957. Previous versions included a silver one hundred yen coin, which was later changed to the current cupronickel material.")
   state.value = ("jpy100")
}

function jpy500(){
   console.log("heii2")
   text1.value = ('500 JPY')
   text2.value = ("The five hundred yen coin is the highest denomination coin in Japan, made of nickel-brass. It features a design of bamboo and chrysanthemum. The five hundred yen coin was first issued in 1982. Since then, its design and material have been adjusted several times for security against counterfeiting.")
   state.value = ("jpy500")
}

function jpy1000(){
   console.log("heii2")
   text1.value = ('1000 JPY')
   text2.value = ("The one thousand yen banknote is the smallest denomination of Japanese yen banknotes. The current design features the portrait of Hideyo Noguchi on the obverse and Mount Fuji with cherry blossoms on the reverse. The one thousand yen banknote was first issued in 1945 and has undergone several design changes. The current design has been in use since 2004.")
   state.value = ("jpy1000")
}

function jpy5000(){
   console.log("heii2")
   text1.value = ('5000 JPY')
   text2.value = ("The five thousand yen banknote is a medium denomination banknote. It features the portrait of Ichiyo Higuchi on the obverse and Ogata Korin's Irises on the reverse. The five thousand yen banknote was first issued in 1957 and has undergone several design changes. The current design has been in use since 2004.")
   state.value = ("jpy5000")
}

function jpy10000(){
   console.log("heii2")
   text1.value = ('10000 JPY')
   text2.value = ("The ten thousand yen banknote is the highest denomination of Japanese yen banknotes. It features the portrait of Yukichi Fukuzawa on the obverse and Byodo-in Phoenix Hall on the reverse. The ten thousand yen banknote was first issued in 1958 and has undergone several design changes. The current design has been in use since 2004.")
   state.value = ("jpy10000")
}



function twd1(){
    text1.value = ("1 NTD")
    text2.value = ("The one yuan coin is the smallest denomination coin, made of an aluminum alloy, which makes it very light. The obverse side features the portrait of Dr. Sun Yat-sen, a founding father of the Republic of China, while the reverse side shows the denomination and the year of minting.")
    state.value = ("twd1")
}

function twd5(){
    text1.value = ("5 NTD")
    text2.value = ("The five yuan coin is made from a copper-nickel alloy. It features the portrait of Chiang Kai-shek, the former President of the Republic of China, on the obverse side, and the denomination along with the year of minting on the reverse side. The five yuan coin was first issued in 1960. It has undergone various design changes over the years but has retained the portrait of Chiang Kai-shek.")
    state.value = ("twd5")
}

function twd10(){
    text1.value = ("10 NTD")
    text2.value = ("The ten yuan coin is also made from a copper-nickel alloy. It features Chiang Kai-shek's portrait on the obverse side, with the denomination and the year of minting on the reverse side. The ten yuan coin was first introduced in 1981. It was designed to meet the needs of higher-value transactions and to replace older banknotes of the same denomination.")
    state.value = ("twd10")
}

function twd50(){
    text1.value = ("50 NTD")
    text2.value = ("The fifty yuan coin is made from a copper-nickel alloy. It features the portrait of Sun Yat-sen on the obverse side and the denomination and the year of minting on the reverse side. The fifty yuan coin was first issued in 1992. It was introduced to facilitate larger transactions and to provide a more durable alternative to paper currency.")
    state.value = ("twd50")
}

function twd100(){
    text1.value = ("100 NTD")
    text2.value = ("The one hundred yuan coin is the highest denomination coin, made from a copper-nickel alloy. It features the portrait of Chiang Kai-shek on the obverse side, with the denomination and the year of minting on the reverse side. ")
    state.value = ("twd100")
}

function twd500(){
    text1.value = ("500 NTD")
    text2.value = ("The 500 yuan banknote is brown and features a scene of children playing baseball on the obverse side, symbolizing youth and education. The reverse side depicts the Hsinchu Science Park, reflecting Taiwan's advancements in science and technology.")
    state.value = ("twd500")
   
}

function twd1000(){
    text1.value = ("1000 NTD")
    text2.value = ("The 1000 yuan banknote is blue and features a classroom scene with children and a globe on the obverse side, emphasizing the importance of education. The reverse side shows a picture of Yushan (Jade Mountain), the highest peak in Taiwan, symbolizing the nation's natural beauty.")
    state.value = ("twd1000")

}





</script>
<style>
.bg-static {
  width: 300px;
  height: 250px;

  background-image: url("C:/Users/ca775/Desktop/moneyexplanation/image/TWD/1.jpg");
}


#blue {
  display: inline-block;
  padding: 0.5em 1em;
  text-decoration: none;
  background: #668ad8;
  color: #FFF;
  border-radius: 4px;
  box-shadow: 0px 0px 0px 5px #668ad8;
  border: dashed 1px #FFF;
}

#blue:hover {
  border: dotted 1px #FFF;
}


#yellow {
  display: inline-block;
  padding: 0.5em 1em;
  text-decoration: none;
  background: #f3bb44;
  color: #FFF;
  border-radius: 4px;
  box-shadow: 0px 0px 0px 5px #f3bb44;
  border: dashed 1px #FFF;
}

#yellow:hover {
  border: dotted 1px #FFF;
}

#sizeforImage{
    width: 200%;
    height: 200%;
    position: relative; /* relativeを指定 */
    top: 150px; /* 上から10px移動 */
    right: 5px
    
}

#line {
      background: linear-gradient(transparent 60%, rgb(122, 248, 132) 30%);
      display: inline-block;
    }

.card{
    width: 90%;
    height: 50%;
    left: 10%;
}

#space{
    top: 30px;

}

</style>