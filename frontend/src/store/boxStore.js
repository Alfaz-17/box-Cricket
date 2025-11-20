// stores/boxStore.js
import { create } from 'zustand'
import { toast } from 'react-hot-toast'
import api from '../utils/api'

const useBoxStore = create(set => ({
  boxes: [],
  loading: true,

  fetchBoxes: async () => {
    try {
      set({ loading: true })

      const res = await api.get('/boxes/my-box')
      const boxes = res.data.boxes || []
      set({ boxes })
      console.log(boxes)

      if (boxes.length === 0) toast.error('No boxes found')
      return boxes
    } catch (error) {
      toast.error('Failed to fetch boxes')
      console.error('Fetch boxes error:', error)
      return []
    } finally {
      set({ loading: false })
    }
  },
}))

export default useBoxStore
