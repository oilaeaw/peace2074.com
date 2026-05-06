import{x as e}from"../nitro/nitro.mjs";const{Schema:i,model:o,models:r}=e,n=new i({version:{type:String,required:!0,index:!0},userId:{type:String,required:!0,index:!0}},{timestamps:!0,collection:"DeployLike"});n.index({version:1,userId:1},{unique:!0});const t=r.DeployLike||o("DeployLike",n);export{t as D};
//# sourceMappingURL=DeployLike.mjs.map
