const Plugins = async(schema, options) => {
    schema.statics.upsert = async function(query, data) {
        let record = await this.findOne(query)
        if (!record) {
            record = new this(data)
        } else {
            Object.keys(data).forEach(k => {
                record[k] = data[k]
            })
        }
        return await record.save()
    }
}
module.exports = Plugins;