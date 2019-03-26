//
// Copyright (C) 2019-present Instructure, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import Foundation

struct SubmissionCommentsElement: RawRepresentable, Element {
    let rawValue: String

    init(rawValue: String) {
        self.rawValue = rawValue
    }

    static func attemptCell(submissionID: String, attempt: Int) -> SubmissionCommentsElement {
        return SubmissionCommentsElement(rawValue: "attemptCell.submission-\(submissionID)-\(attempt)")
    }

    static func attemptView(attempt: Int) -> SubmissionCommentsElement {
        return SubmissionCommentsElement(rawValue: "attemptView.\(attempt)")
    }

    static func audioCell(commentID: String) -> SubmissionCommentsElement {
        return SubmissionCommentsElement(rawValue: "audioCell.\(commentID)")
    }

    static func fileView(fileID: Int) -> SubmissionCommentsElement {
        return SubmissionCommentsElement(rawValue: "fileView.\(fileID)")
    }

    static func textCell(commentID: String) -> SubmissionCommentsElement {
        return SubmissionCommentsElement(rawValue: "textCell.\(commentID)")
    }

    static func videoCell(commentID: String) -> SubmissionCommentsElement {
        return SubmissionCommentsElement(rawValue: "videoCell.\(commentID)")
    }
}
