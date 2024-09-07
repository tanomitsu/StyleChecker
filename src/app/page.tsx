"use client"

import { LeftPanel } from "@/components/LeftPanel"
import { RightPanel, RightPanelProps } from "@/components/RightPanel"
import { Box, HStack } from "@chakra-ui/react"

const rightPanelProps: RightPanelProps = {
  advisorBubblePropsList: [
    { emotion: "happy", text: "Hello!" },
    { emotion: "angry", text: "Go away!" },
    {
      emotion: "neutral",
      text: "吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。しかもあとで聞くとそれは書生という人間中で一番獰悪な種族であったそうだ。この書生というのは時々我々を捕えて煮て食うという話である。しかしその当時は何という考もなかったから別段恐しいとも思わなかった。ただ彼の掌に載せられてスーと持ち上げられた時何だかフワフワした感じがあったばかりである。掌の上で少し落ちついて書生の顔を見たのがいわゆる人間というものの見始であろう。この時妙なものだと思った感じが今でも残っている。第一毛をもって装飾されべきはずの顔がつるつるしてまるで薬缶だ。",
    },
  ],
}

export default function Home() {
  return (
    <div>
      <HStack>
        <Box w="60%" p={4}>
          <LeftPanel />
        </Box>
        <Box w="40%">
          <RightPanel {...rightPanelProps} />
        </Box>
      </HStack>
    </div>
  )
}
