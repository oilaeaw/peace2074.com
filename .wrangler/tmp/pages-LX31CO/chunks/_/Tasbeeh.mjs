import{x as e}from"../nitro/nitro.mjs";const{Schema:s,model:t,models:i}=e,o=new s({userId:{type:String,required:!0,index:!0},daily:{type:s.Types.Mixed,default:[]},sessions:{type:s.Types.Mixed,default:[]}},{timestamps:!0,collection:"Tasbeeh"}),a=i.Tasbeeh||t("Tasbeeh",o);export{a as T};
//# sourceMappingURL=Tasbeeh.mjs.map
