import{x as e}from"../nitro/nitro.mjs";const{Schema:r,model:t,models:s}=e,o=new r({userId:{type:String,required:!0,unique:!0},completedSuras:[{type:Number}],lastUpdated:{type:Date,default:Date.now}},{timestamps:!0,collection:"QuranProgress"}),a=s.QuranProgress||t("QuranProgress",o);export{a as Q};
//# sourceMappingURL=QuranProgress.mjs.map
