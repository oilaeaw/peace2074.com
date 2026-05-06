import{x as e}from"../nitro/nitro.mjs";const{Schema:i,model:o,models:r}=e,t=new i({slug:{type:String,required:!0,index:!0},userId:{type:String,required:!0,index:!0}},{timestamps:!0,collection:"BlogLike"});t.index({slug:1,userId:1},{unique:!0});const n=r.BlogLike||o("BlogLike",t);export{n as B};
//# sourceMappingURL=BlogLike.mjs.map
