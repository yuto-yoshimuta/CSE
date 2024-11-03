'use client'

import { useState } from 'react'
import { Camera, Menu, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function Component() {
  const [cameraActive, setCameraActive] = useState(false)
  const [recognizedAmounts, setRecognizedAmounts] = useState({ jpy: '', twd: '' })
  const [convertedAmounts, setConvertedAmounts] = useState({ jpy: '', twd: '' })
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])

  const toggleCamera = () => {
    setCameraActive(!cameraActive)
    if (!cameraActive) {
      // Simulating camera access and recognition
      setTimeout(() => {
        const recognizedJPY = Math.floor(Math.random() * 10000)
        const recognizedTWD = Math.floor(recognizedJPY * 0.26)
        setRecognizedAmounts({ jpy: recognizedJPY.toString(), twd: recognizedTWD.toString() })
        convertCurrency(recognizedJPY, recognizedTWD)
      }, 2000)
    } else {
      setRecognizedAmounts({ jpy: '', twd: '' })
      setConvertedAmounts({ jpy: '', twd: '' })
    }
  }

  const convertCurrency = (jpyAmount, twdAmount) => {
    // Simulating currency conversion
    const convertedJPY = Math.floor(twdAmount * 3.85)
    const convertedTWD = Math.floor(jpyAmount * 0.26)
    setConvertedAmounts({ jpy: convertedJPY.toString(), twd: convertedTWD.toString() })
    setHistory(prev => [...prev, {
      recognized: { jpy: jpyAmount, twd: twdAmount },
      converted: { jpy: convertedJPY, twd: convertedTWD }
    }])
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="h-6 w-6" />
            <h1 className="text-xl font-semibold">CashScanExplorer</h1>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              {/* Add menu items here */}
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-center">
          <Button
            variant={cameraActive ? "destructive" : "default"}
            onClick={toggleCamera}
            className="w-full max-w-xs"
          >
            <Camera className="mr-2 h-4 w-4" />
            {cameraActive ? 'カメラ停止' : 'カメラ起動'}
          </Button>
        </div>

        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          {cameraActive ? (
            <video className="w-full h-full rounded-lg" autoPlay playsInline />
          ) : (
            <p className="text-muted-foreground">カメラが表示されます</p>
          )}
        </div>

        {error && (
          <p className="text-destructive text-center">{error}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">認識した金額</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium">JPY:</label>
              <Input
                value={recognizedAmounts.jpy}
                readOnly
                placeholder="認識した日本円の金額"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">TWD:</label>
              <Input
                value={recognizedAmounts.twd}
                readOnly
                placeholder="認識した台湾ドルの金額"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">変換後の金額</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium">JPY:</label>
              <Input
                value={convertedAmounts.jpy}
                readOnly
                placeholder="変換後の日本円の金額"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">TWD:</label>
              <Input
                value={convertedAmounts.twd}
                readOnly
                placeholder="変換後の台湾ドルの金額"
              />
            </div>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <History className="mr-2 h-4 w-4" />
              履歴を表示
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>変換履歴</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              {history.map((item, index) => (
                <div key={index} className="border-b pb-2">
                  <p className="font-medium">認識した金額:</p>
                  <p>JPY: {item.recognized.jpy}, TWD: {item.recognized.twd}</p>
                  <p className="font-medium mt-2">変換後の金額:</p>
                  <p>JPY: {item.converted.jpy}, TWD: {item.converted.twd}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <footer className="border-t py-4 bg-muted/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 CashScanExplorer. All rights reserved.
        </div>
      </footer>
    </div>
  )
}