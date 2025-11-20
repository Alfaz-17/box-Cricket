const uploadImage = async file => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'cricket_box')

    const response = await fetch('https://api.cloudinary.com/v1_1/your-cloud-name/image/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('Error uploading image:', error)
    throw new Error('Failed to upload image')
  }
}

export default uploadImage
