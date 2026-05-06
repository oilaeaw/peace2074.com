import{x as e}from"../nitro/nitro.mjs";const{Schema:t,model:r,models:a}=e,d=new t({userId:{type:String,required:!0,index:!0},sura:{type:Number,required:!0,index:!0},timestamp:{type:Date,default:Date.now,index:!0}},{collection:"ReaderStats"}),i=a.ReaderStats||r("ReaderStats",d);export{i as R};
//# sourceMappingURL=ReaderStats.mjs.map
