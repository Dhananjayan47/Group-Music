import fs from "fs"
import path from "path"

const deleteRoomUploads = (roomId) => {
    console.log('898');
    const roomPath = path.join(process.cwd(),"uploads",roomId);

    console.log("msg from delete",roomPath);
    // console.log(process.cwd());
    if(fs.existsSync(roomPath)){
        fs.rmSync(roomPath,{recursive:true, force:true});
    }

    
    
}
export default deleteRoomUploads;