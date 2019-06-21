const web_assets = {};
module.exports = web_assets;

const file_model =require('../../lib/file_model');

web_assets.fetch_asset = (payload, callback) => {

    
    
    file_model.read_public_file('assets', payload.asset_file_path, (err, asset, type) => {
        
        if ( ! err && asset) {
            
            let allowed_assets = [ 'css', 'js', 'png', 'jpg' ];
            if (allowed_assets.includes(type)) {

                callback(200, false, asset, type );
            } else {
                callback(412, true, { err: 'Invalid asset type'});
            }
        } else {
            callback(500, true, { err: 'Internal error'});
        }
    });
}